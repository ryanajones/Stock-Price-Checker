const { json } = require('body-parser');
const fetch = require('node-fetch');
const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);

mongoose.connect(
  process.env.DB,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err, db) => {
    if (err) return console.log(err);
    console.log('Successful database connection.');
  }
);

// Mongoose schema
const { Schema } = mongoose;

const stockSchema = new Schema({
  symbol: String,
  price: Number,
  like: Boolean,
});

// Mongoose model
const Stocks = mongoose.model('stocks', stockSchema);

module.exports = function (app) {
  app.route('/api/stock-prices').get(function (req, res) {
    const { stock, like } = req.query;
    console.log(stock);

    // Fetch stock price from proxy
    async function getStockPrice(stockSymbol) {
      try {
        const response = await fetch(
          `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockSymbol}/quote`
        );
        const data = await response.json();
        return res.json({
          stockData: { stock: data.symbol, price: data.latestPrice },
        });
      } catch (err) {
        console.log(err);
      }
    }

    // Check to see if stock is present
    if (stock) {
      // Handle if there are two stocks
      if (!Array.isArray(stock)) {
        getStockPrice(stock);
      }
    }
  });
};
