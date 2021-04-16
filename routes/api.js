/* eslint-disable prefer-destructuring */
const { json } = require('body-parser');
const fetch = require('node-fetch');
const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);

// Mongoose schema
const { Schema } = mongoose;

const stockSchema = new Schema({
  symbol: String,
  likes: { type: [String], default: [] },
});

const Stocks = mongoose.model('stocks', stockSchema);

// Database retrieve and update
const saveStock = (symbol, like, ip) =>
  Stocks.findOne({ symbol }).then((res) => {
    if (!res) {
      const newStock = new Stocks({ symbol, likes: like ? [ip] : [] });
      return newStock.save();
    }
    if (like && res.likes.indexOf(ip) === -1) {
      res.likes.push(ip);
    }
    return res.save();
  });

// Fetch stock price from proxy
const getStockPrice = (stockSymbol) =>
  fetch(
    `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockSymbol}/quote`
  )
    .then((response) => response.json())
    .then((data) => ({
      stock: data.symbol,
      price: data.latestPrice,
    }));

// Parse data for json return
const parseData = (data) => {
  let stockData = [];
  let i = 0;
  const likes = [];
  while (i < data.length) {
    const stock = {
      stock: data[i + 1].stock,
      price: data[i + 1].price,
    };
    likes.push(data[i].likes.length);
    stockData.push(stock);
    i += 2;
  }

  // Decipher if one or two stocks will be returned
  if (stockData.length === 2) {
    stockData[0].rel_likes = likes[0] - likes[1];
    stockData[1].rel_likes = likes[1] - likes[0];
  } else {
    stockData = stockData[0];
    stockData.likes = likes[0];
  }
  return { stockData };
};

module.exports = function (app) {
  app.route('/api/stock-prices').get(function (req, res) {
    let { stock, like } = req.query;

    // Handle main operation
    if (!Array.isArray(stock)) {
      stock = [stock];
    }

    const promises = [];
    stock.forEach((symbol) => {
      promises.push(saveStock(symbol, like, req.ip));

      promises.push(getStockPrice(symbol));
    });

    Promise.all(promises)
      .then((data) => {
        const parsedData = parseData(data);
        res.json(parsedData);
      })
      .catch((err) => {
        if (err) return console.log(err);
        res.send(err);
      });
  });
};
