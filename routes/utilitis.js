var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { isLoggedIn } = require('../helpers/util')


/* GET home page. */
module.exports = function (db) {

  router.get('/', isLoggedIn, function (req, res, next) {
    db.query('SELECT * FROM units', (err, data) => {
      if (err) return res.send(err)
      res.render('utilitis/units', { user: req.session.user, current: 'units', units: data.rows });
    })
  });

  router.get('/add', isLoggedIn, function (req, res, next) {
    res.render('utilitis/add', { user: req.session.user, current: 'units' });
  })

  router.post('/add', async (req, res) => {
    try {
      const { unit, name, note } = req.body
      const { rows: data } = await db.query('INSERT INTO units (unit, name, note) VALUES ($1, $2, $3)', [unit, name, note])
      res.redirect('/units')
    } catch (err) {
      console.log(err)
      res.send(err)
    }
  })

  router.get('/edit/:unit_id', async (req, res) => {
    try {
      const { unit_id } = req.params

      const { rows: data } = await db.query('SELECT * FROM units WHERE unit_id = $1', [unit_id])
      res.render('utilitis/unitEdit', { item: data[0], user: req.session.user, current: 'units' })
    } catch (err) {
      res.send(err)
    }
  })

  router.post('/edit/:unit_id', async (req, res) => {
    try {
      const { unit_id } = req.params
      console.log(req.params)
      const { unit, name, note } = req.body
      console.log(req.body)
      await db.query('UPDATE units SET unit=$1, name=$2, note=$3 WHERE unit_id=$4', [unit, name, note, unit_id])

      res.redirect('/units')
    } catch (err) {
      res.send(err)
    }
  })

  router.get('/delete/:unit_id', async (req, res) => {
    console.log('masuk')
    try {
      const { unit_id } = req.params

      const { rows: data } = await db.query('DELETE FROM units WHERE unit_id = $1', [unit_id])
      res.redirect('/units')
    } catch (err) {
      res.send(err)
    }
  })


  return router;
}


