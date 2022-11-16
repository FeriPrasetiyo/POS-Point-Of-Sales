var express = require('express');
var router = express.Router();
const { isLoggedIn } = require('../helpers/util')
const path = require('path')


/* GET home page. */
module.exports = function (db) {
  router.get('/', isLoggedIn, function (req, res, next) {
    db.query('SELECT * FROM goods', (err, data) => {
      if (err) return res.send(err)
      res.render('goods/goodindex', { user: req.session.user, current: 'goods', goods: data.rows });
    })
  });

  router.get('/add', isLoggedIn, function (req, res, next) {
    db.query('SELECT * FROM units', (err, data) => {
      if (err) return res.send(err)
      res.render('goods/goodsadd', { user: req.session.user, current: 'goods', units: data.rows });
    })
  })
  router.post('/add', async (req, res) => {
    try {
      const { barcode, name, stock, purchase, selling, unit } = req.body
      console.log(req.body)
      let sampleFile;
      let uploadPath;
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
      }

      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      sampleFile = req.files.sampleFile;
      uploadPath = path.join(__dirname, '..', 'public', 'images', 'upload', `${Date.now()}-${sampleFile.name}`);


      const { rows: data } = await db.query('INSERT INTO goods (barcode, name, stock, purchaseprice, sellingprice, unit, picture) VALUES ($1, $2, $3, $4, $5, $6, $7)', [barcode, name, stock, purchase, selling, unit, uploadPath])
      res.redirect('/goods')
    } catch (err) {
      res.send(err)
    }
  })

  router.get('/edit/:barcode', async (req, res) => {
    try {
      const { barcode } = req.params

      const { rows: data } = await db.query('SELECT * FROM goods WHERE barcode = $1', [barcode])
      res.render('goods/goodedit', { item: data[0], user: req.session.user, current: 'goods' })
    } catch (err) {
      res.send(err)
    }
  })

  router.post('/edit/:unit', async (req, res) => {
    try {
      const { unit } = req.params
      console.log(req.params)
      const { name, note } = req.body
      console.log(req.body)
      await db.query('UPDATE units SET name=$1, note=$2 WHERE unit=$3', [name, note, unit])

      res.redirect('/units')
    } catch (err) {
      res.send(err)
    }
  })

  router.get('/delete/:barcode', async (req, res) => {
    console.log('masuk')
    try {
      const { barcode } = req.params

      const { rows: data } = await db.query('DELETE FROM goods WHERE barcode = $1', [barcode])
      res.redirect('/units')
    } catch (err) {
      res.send(err)
    }
  })


  return router;
}


