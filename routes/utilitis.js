var express = require('express');
var router = express.Router();
const { isLoggedIn } = require('../helpers/util')


/* GET home page. */
module.exports = function (db) {

  router.get('/', isLoggedIn, function (req, res, next) {
    db.query('SELECT * FROM units', (err, data) => {
      if (err) return res.send(err)
      res.render('utilitis/units', { user: req.session.user, current: 'units', units: data.rows });
    })
  });

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

  router.get('/edit/:unit', async (req, res) => {
    try {
      const { unit } = req.params

      const { rows: data } = await db.query('SELECT * FROM units WHERE unit = $1', [unit])
      res.render('utilitis/unitEdit', { item: data[0], user: req.session.user, current: 'units' })
    } catch (err) {
      res.send(err)
    }
  })

  router.post('/edit/:unit', async (req, res) => {
    try {
      const { unit } = req.params
      const { name, note } = req.body
      await db.query('UPDATE units SET name=$1, note=$2 WHERE unit=$3', [name, note, unit])

      res.redirect('/units')
    } catch (err) {
      res.send(err)
    }
  })

  router.get('/delete/:unit_id', async (req, res) => {
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


