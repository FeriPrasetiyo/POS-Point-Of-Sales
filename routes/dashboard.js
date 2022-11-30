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


      const { rows: totalpurch } = await db.query("SELECT to_char(time, 'Mon YY') AS monthly, to_char(time, 'MM YY') AS forsort, sum(totalsum) AS totalpurch FROM purchases GROUP BY monthly, forsort ORDER BY forsort")
      const { rows: totalsales } = await db.query("SELECT to_char(time, 'Mon YY') AS monthly, to_char(time, 'MM YY') AS forsort, sum(totalsum) AS totalsales FROM sales GROUP BY monthly, forsort ORDER BY forsort")
      res.json({ member, direct, totalpurch, totalsales })
    } catch (err) {
      res.send(err)
    }
  })

  router.get('/datatable', async (req, res) => {
    console.log("masuk")
    let params = []

    if (req.query.search.value) {
      params.push(`barcode ilike '%${req.query.search.value}%'`)
    }

    const limit = req.query.length
    const offset = req.query.start
    const sortBy = req.query.columns[req.query.order[0].column].data
    const sortMode = req.query.order[0].dir

    const total = await db.query(`select count(*) as total from goods${params.length > 0 ? ` where ${params.join(' or ')}` : ''}`)
    const data = await db.query(`select * from goods${params.length > 0 ? ` where ${params.join(' or ')}` : ''} order by ${sortBy} ${sortMode} limit ${limit} offset ${offset} `)
    const response = {
      "draw": Number(req.query.draw),
      "recordsTotal": total.rows[0].total,
      "recordsFiltered": total.rows[0].total,
      "data": data.rows
    }
    res.json(response)
  })
  return router;
}


