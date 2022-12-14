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
    const data = await db.query(`SELECT purchases.*, suppliers.* FROM purchases LEFT JOIN suppliers ON purchases.supplier = suppliers.supplierid${params.length > 0 ? ` where ${params.join(' or ')}` : ''} order by ${sortBy} ${sortMode} limit ${limit} offset ${offset} `)
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
    try {
      const purchases = await db.query('SELECT * FROM purchases WHERE invoice = $1', [req.params.invoice])
      const { rows: data } = await db.query('SELECT barcode, name FROM goods order by barcode')
      const { rows: suppliers } = await db.query('SELECT supplierid, name FROM suppliers')
      res.render('purchases/purchasesadd', {
        moment,
        purchases: purchases.rows[0],
        barang: data,
        suppliers,
        user: req.session.user,
        current: 'purchases'
      })
    } catch (err) {
      res.send(err)
    }
  })

  router.post('/show/:invoice', isLoggedIn, async (req, res) => {
    try {
      const { invoice } = req.params
      const { supplier } = req.body
      const getOperator = { user: req.session.user.userid }
      const operator = getOperator.user
      await db.query('UPDATE purchases SET supplier = $1, operator = $2 WHERE invoice = $3', [supplier, operator, invoice])
      res.redirect('/purchases')
    } catch (err) {
      res.send(err)
    }
  })

  router.get('/goods/:barcode', async (req, res) => {
    try {
      const { barcode } = req.params
      const { rows } = await db.query('SELECT * FROM goods WHERE barcode = $1', [barcode])
      res.json(rows[0])
    } catch (err) {
      res.send(err)
    }
  })

  router.post('/additem', async (req, res) => {
    try {
      const { invoice, itemcode, quantity } = req.body
      const operator = { user: req.session.user.userid }
      const detail = await db.query('INSERT INTO purchaseitems (invoice, itemcode, quantity)VALUES ($1, $2, $3) returning *', [invoice, itemcode, quantity]);
      const { rows } = await db.query('SELECT * FROM purchases WHERE invoice = $1', [invoice])
      res.json(rows[0])
    } catch (err) {
      res.send(err)
    }
  })

  router.get('/details/:invoice', isLoggedIn, async (req, res) => {
    try {
      const { rows } = await db.query('SELECT pi.*, g.name FROM purchaseitems as pi LEFT JOIN goods as g ON pi.itemcode = g.barcode WHERE pi.invoice = $1 ORDER BY pi.id', [req.params.invoice]);
      res.json(rows)
    } catch (err) {
      res.send(err)
    }
  })
  router.get('/deleteitem/:id', isLoggedIn, async function (req, res, next) {
    try {
      const { id } = req.params
      const { rows: data } = await db.query('DELETE FROM purchaseitems WHERE id = $1 returning *', [id])
      res.redirect(`/purchases/show/${data[0].invoice}`)
    } catch (err) {
      res.send(err)
    }
  })

  router.get('/delete/:invoice', isLoggedIn, async (req, res, next) => {
    try {
      const { invoice } = req.params
      const { rows } = await db.query('DELETE FROM purchases WHERE invoice = $1', [invoice])

      res.redirect('/purchases');
    } catch (err) {
      res.send(err)
    }
  });

  return router;
}


