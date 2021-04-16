const chaiHttp = require('chai-http');
const chai = require('chai');

const { assert } = chai;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  test('Viewing one stock: GET request to /api/stock-prices/', (done) => {
    chai
      .request(server)
      .get('/api/stock-prices?stock=GOOG')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body, 'response should be an object');
        assert.property(res.body, 'stockData');
        assert.property(
          res.body.stockData,
          'stock',
          'stockData object should container stock'
        );
        assert.property(
          res.body.stockData,
          'price',
          'stockData object should container stock'
        );
        assert.property(
          res.body.stockData,
          'likes',
          'stockData object should container stock'
        );
        assert.equal(res.body.stockData.stock, 'GOOG');
        done();
      });
  });
});
