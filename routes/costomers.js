var express = require('express');
var router = express.Router();
const { isLoggedIn } = require('../helpers/util')


/* GET home page. */
module.exports = function (db) {

  router.get('/', isLoggedIn, function (req, res, next) {
    db.query('SELECT * FROM customers', (err, data) => {
      if (err) return res.send(err)
      res.render('costomers/costomersindex', { user: req.session.user, current: 'suppliers', suppliers: data.rows });
    })
  });

  router.get('/datatable', async (req, res) => {
    let params = []

    if (req.query.search.value) {
      params.push(`name ilike '%${req.query.search.value}%'`)
    }

    if (req.query.search.value) {
      params.push(`address ilike '%${req.query.search.value}%'`)
    }

    if (req.query.search.value) {
      params.push(`phone ilike '%${req.query.search.value}%'`)
    }


    const limit = req.query.length
    const offset = req.query.start
    const sortBy = req.query.columns[req.query.order[0].column].data
    const sortMode = req.query.order[0].dir

    const total = await db.query(`select count(*) as total from customers${params.length > 0 ? ` where ${params.join(' or ')}` : ''}`)
    const data = await db.query(`select * from customers${params.length > 0 ? ` where ${params.join(' or ')}` : ''} order by ${sortBy} ${sortMode} limit ${limit} offset ${offset} `)
    const response = {
      "draw": Number(req.query.draw),
      "recordsTotal": total.rows[0].total,
      "recordsFiltered": total.rows[0].total,
      "data": data.rows
    }
    res.json(response)
  })

  router.get('/add', isLoggedIn, function (req, res, next) {
    res.render('costomers/costomersadd', { user: req.session.user, current: 'costomers' });
  })

  router.post('/add', async (req, res) => {
    try {
      const { name, address, phone } = req.body
      const { rows: data } = await db.query('INSERT INTO customers (name, address, phone) VALUES ($1, $2, $3)', [name, address, phone])
      res.redirect('/costomers')
    } catch (err) {
      res.send(err)
    }
  })

  router.get('/edit/:custumeid', async (req, res) => {
    try {
      const { custumeid } = req.params

      const { rows: data } = await db.query('SELECT * FROM customers WHERE customerid = $1', [custumeid])
      res.render('costomers/costomersedit', { item: data[0], user: req.session.user, current: 'units' })
    } catch (err) {
      res.send(err)
    }
  })

  router.post('/edit/:customerid', async (req, res) => {
    try {
      const { customerid } = req.params
      const { name, address, phone } = req.body
      await db.query('UPDATE customers SET name=$1, address=$2, phone=$3 WHERE customerid = $4', [name, address, phone, customerid])

      res.redirect('/costomers')
    } catch (err) {
      res.send(err)
    }
  })

  router.get('/delete/:customerid', async (req, res) => {
    try {
      const { customerid } = req.params

      const { rows: data } = await db.query('DELETE FROM customers WHERE customerid = $1', [customerid])
      res.redirect('/costomers')
    } catch (err) {
      res.send(err)
    }
  })


  return router;
}


