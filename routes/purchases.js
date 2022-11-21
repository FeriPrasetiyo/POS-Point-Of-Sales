const { name } = require('ejs');
var express = require('express');
var router = express.Router();
const { isLoggedIn } = require('../helpers/util')
const moment = require("moment")


/* GET home page. */
module.exports = function (db) {

  router.get('/', isLoggedIn, function (req, res, next) {
    db.query('SELECT * FROM purchases', (err, data) => {
      if (err) return res.send(err)
      res.render('purchases/purchasesindex', { user: req.session.user, current: 'purcases', purcases: data.rows });
    })
  });

  router.get('/datatable', async (req, res) => {
    let params = []

    if (req.query.search.value) {
      params.push(`invoice ilike '%${req.query.search.value}%'`)
    }


    const limit = req.query.length
    const offset = req.query.start
    const sortBy = req.query.columns[req.query.order[0].column].data
    const sortMode = req.query.order[0].dir

    const total = await db.query(`select count(*) as total from purchases${params.length > 0 ? ` where ${params.join(' or ')}` : ''}`)
    const data = await db.query(`select * from purchases${params.length > 0 ? ` where ${params.join(' or ')}` : ''} order by ${sortBy} ${sortMode} limit ${limit} offset ${offset} `)
    const response = {
      "draw": Number(req.query.draw),
      "recordsTotal": total.rows[0].total,
      "recordsFiltered": total.rows[0].total,
      "data": data.rows
    }
    res.json(response)
  })

  router.get('/add', isLoggedIn, async (req, res, next) => {
    try {
      const { rows } = await db.query('INSERT INTO purchases(totalsum) VALUES(0) returning *')
      res.redirect(`/purchases/show/${rows[0].invoice}`)
    } catch (err) {
      res.send(err)
    }
  })

  router.get('/show/:invoice', async (req, res) => {
    console.log("masuk")
    try {
      const purchases = await db.query('SELECT * FROM purchases WHERE invoice = $1', [req.params.invoice])
      const { rows: data } = await db.query('SELECT barcode, name FROM goods order by barcode')
      console.log(data)
      res.render('purchases/purchasesadd', {
        moment,
        purchases: purchases.rows[0],
        barang: data,
        user: req.session.user,
        current: 'purchases'
      })
    } catch (err) {
      res.send(err)
    }
  })

  router.post('/additem', async (req, res) => {
    console.log("masuk")
    try {
      const { rows } = db.query('INSET INTO purchaseitems(invoice,itemcode,quantity) VALUES ($1 ,$2 ,$3) returning *'[req.body.invoice, req.body.itemcode, req.body.quantity])
      res.json(rows[0])
    } catch (err) {
      console.log(err)
      res.send(err)
    }
  })
  router.get('/goods/:barcode', async (req, res) => {
    try {
      const { barcode } = req.params
      const { rows } = await db.query('SELECT * FROM goods WHERE barcode = $1', [barcode])
      res.json(rows[0])
    } catch (err) {
      console.log(err)
      res.send(err)
    }
  })

  router.post('/additem', async (req, res) => {
    console.log("masuk")
    try {
      const { rows } = db.query('INSET INTO purchaseitems(invoice,itemcode,quantity) VALUES ($1 ,$2 ,$3) returning *'[req.body.invoice, req.body.itemcode, req.body.quantity])
      res.json(rows[0])
    } catch (err) {
      console.log(err)
      res.send(err)
    }
  })

  return router;
}


