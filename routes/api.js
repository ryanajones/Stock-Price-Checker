const { json } = require('body-parser');
const fetch = require('node-fetch');
const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);

// Mongoose schema
const { Schema } = mongoose;

const stockSchema = new Schema({
  symbol: String,
  price: Number,
  likes: Number,
});

const Stocks = mongoose.model('stocks', stockSchema);

// Database retrieve and update
const stockDatabase = (stockSymbol) => {
  let { symbol, price, likes } = stockSymbol;

  return Stocks.findOne({ symbol }).then((res) => {
    if (!res) {
      const newStock = new Stocks({ symbol, price, likes });
      return newStock.save();
    }

    res.price = price;
    if (likes) {
      likes = res.likes + likes;
      res.likes = likes;
    }
    return res.save();
  });
};

module.exports = function (app) {
  app.route('/api/stock-prices').get(function (req, res) {
    let { stock, like } = req.query;
    console.log(stock, like);
    // Fetch stock price from proxy
    const getStockPrice = (stockSymbol) =>
      fetch(
        `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockSymbol}/quote`
      )
        .then((response) => response.json())
        .then((data) => ({
          stockData: { stock: data.symbol, price: data.latestPrice },
        }));

    // Handle main operation
    const mainOperation = async () => {
      if (like === 'true') {
        like = 1;
      }
      if (stock && !Array.isArray(stock)) {
        const stockInfo = await getStockPrice(stock);
        const obj = {
          symbol: stockInfo.stockData.stock,
          price: stockInfo.stockData.price,
          likes: like,
        };
        const st = await stockDatabase(obj);
        const { symbol, price, likes } = st;
        res.json({ stockData: { stock: symbol, price, likes } });
      }
    };
    mainOperation();
    // Handle if there are one or two stocks
  });
};
