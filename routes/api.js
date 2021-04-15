/* eslint-disable prefer-destructuring */
const { json } = require('body-parser');
const fetch = require('node-fetch');
const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);

// Mongoose schema
const { Schema } = mongoose;

const stockSchema = new Schema({
  symbol: String,
  likes: { type: Number, default: 0 },
});

const Stocks = mongoose.model('stocks', stockSchema);

// Database retrieve and update
const saveStock = (symbol, like) => {
  let likes = like;
  return Stocks.findOne({ symbol }).then((res) => {
    if (!res) {
      const newStock = new Stocks({ symbol, likes });
      return newStock.save();
    }

    if (likes) {
      likes = res.likes + likes;
      res.likes = likes;
    }
    return res.save();
  });
};

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

const parseData = (data) => {
  let stockData = [];
  let i = 0;
  while (i < data.length) {
    const stock = {
      stock: data[i + 1].stock,
      price: data[i + 1].price,
    };
    stockData.push(stock);
    i += 2;
  }

  if (stockData.length === 2) {
    stockData[0].rel_likes = data[0].likes - data[2].likes;
    stockData[1].rel_likes = data[2].likes - data[0].likes;
  } else {
    stockData = stockData[0];
    stockData.likes = data[0].likes;
  }
  return { stockData };
  /*  // Handle return for single stock
  if (data.length === 2) {
    return {
      stockData: {
        stock: data[1].stock,
        price: data[1].price,
        likes: data[0].likes,
      },
    };
  }
  // Handle return for two stocks
  return {
    stockData: [
      {
        stock: data[1].stock,
        price: data[1].price,
        rel_likes: data[0].likes - data[2].likes,
      },
      {
        stock: data[3].stock,
        price: data[3].price,
        rel_likes: data[2].likes - data[0].likes,
      },
    ],
  }; */
};

module.exports = function (app) {
  app.route('/api/stock-prices').get(function (req, res) {
    let { stock, like } = req.query;

    // Handle main operation

    console.log(req.ip);
    if (like === 'true') {
      like = 1;
    }
    if (!Array.isArray(stock)) {
      stock = [stock];
    }

    const promises = [];
    stock.forEach((symbol) => {
      promises.push(saveStock(symbol, like));

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
