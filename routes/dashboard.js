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

    }
  });

  router.get('/revsource', isLoggedIn, async (req, res, next) => {
    try {
      const { rows: direct } = await db.query('SELECT COUNT(*) FROM sales WHERE customer = 1')
      console.log(direct)
      const { rows: member } = await db.query('SELECT COUNT(*) FROM sales WHERE customer != 1')
      console.log(member)

      res.json({ member, direct })
    } catch (error) {
      console.log(error)
    }
  })


  router.get('/datatable', async (req, res) => {
    let params = []

    if (req.query.search.value) {
      params.push(`unit ilike '%${req.query.search.value}%'`)
    }

    if (req.query.search.value) {
      params.push(`name ilike '%${req.query.search.value}%'`)
    }

    if (req.query.search.value) {
      params.push(`note ilike '%${req.query.search.value}%'`)
    }


    const limit = req.query.length
    const offset = req.query.start
    const sortBy = req.query.columns[req.query.order[0].column].data
    const sortMode = req.query.order[0].dir

    const total = await db.query(`select count(*) as total from units${params.length > 0 ? ` where ${params.join(' or ')}` : ''}`)
    const data = await db.query(`select * from units${params.length > 0 ? ` where ${params.join(' or ')}` : ''} order by ${sortBy} ${sortMode} limit ${limit} offset ${offset} `)
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


