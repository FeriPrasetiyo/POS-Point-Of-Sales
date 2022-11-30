var express = require('express');
var router = express.Router();
const { isLoggedIn } = require('../helpers/util')


/* GET home page. */
module.exports = function (db) {

  router.get('/', isLoggedIn, async function (req, res, next) {
    try {
      const { rows: purhcases } = await db.query('SELECT sum(totalsum) FROM purchases')
      const { rows: sales } = await db.query('SELECT sum(totalsum) FROM sales')
      const { rows: customers } = await db.query('SELECT COUNT(*) from suppliers')

      res.render('dashboard/dashboard', { user: req.session.user, current: 'dashboard', purhcases, sales, customers });
    } catch (err) {
      res.send(err)
    }
  });

  router.get('/revsource', isLoggedIn, async (req, res, next) => {
    try {
      const { rows: direct } = await db.query('SELECT COUNT(*) FROM sales WHERE customer = 1')
      const { rows: member } = await db.query('SELECT COUNT(*) FROM sales WHERE customer != 1')


      const { rows: totalpurch } = await db.query("SELECT sum(totalsum)FROM purchases WHERE time BETWEEN '20221125' AND '20221225'")
      console.log(totalpurch)
      const { rows: totalsales } = await db.query("SELECT sum(totalsum)FROM sales WHERE time BETWEEN '20221125' AND '20221225'")
      res.json({ member, direct, totalpurch, totalsales })
    } catch (err) {
      res.send(err)
    }
  })


  // router.get('/datatable', isLoggedIn, async (req, res, next) => {
  //   try {
  //     const { rows: data } = await db.query('SELECT time FROM sales CROSS JOIN purchases')
  //     console.log(data, "<<")

  //   } catch (err) {
  //     res.send(err)
  //   }
  // })

  return router;
}


