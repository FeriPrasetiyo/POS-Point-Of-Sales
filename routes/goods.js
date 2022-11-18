var express = require('express');
var router = express.Router();
const { isLoggedIn } = require('../helpers/util')
const path = require('path')
var fs = require('fs');


/* GET home page. */
module.exports = function (db) {
    router.get('/', isLoggedIn, function (req, res, next) {
        db.query('SELECT * FROM goods', (err, data) => {
            if (err) return res.send(err)
            res.render('goods/goodindex', { user: req.session.user, current: 'goods', goods: data.rows });
        })
    });

    router.get('/datatable', async (req, res) => {
        let params = []

        if (req.query.search.value) {
            params.push(`barcode ilike '%${req.query.search.value}%'`)
        }

        if (req.query.search.value) {
            params.push(`name ilike '%${req.query.search.value}%'`)
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

    router.get('/add', isLoggedIn, function (req, res, next) {
        db.query('SELECT * FROM units', (err, data) => {
            if (err) return res.send(err)
            res.render('goods/goodsadd', { user: req.session.user, current: 'goods', units: data.rows });
        })
    })
    router.post('/add', async (req, res) => {
        try {
            const { barcode, name, stock, purchase, selling, unit } = req.body

            let sampleFile;
            let uploadPath;
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).send('No files were uploaded.');
            }

            // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
            sampleFile = req.files.sampleFile;
            const imagefiles = `${Date.now()}-${sampleFile.name}`
            uploadPath = path.join(__dirname, '..', 'public', 'images', 'upload', imagefiles);
            sampleFile.mv(uploadPath)

            const { rows: data } = await db.query('INSERT INTO goods (barcode, name, stock, purchaseprice, sellingprice, unit, picture) VALUES ($1, $2, $3, $4, $5, $6, $7)', [barcode, name, stock, purchase, selling, unit, imagefiles])
            res.redirect('/goods')
        } catch (err) {
            res.send(err)
        }
    })

    router.get('/edit/:barcode', async (req, res) => {
        try {
            const { rows: resut } = await db.query('SELECT * FROM units')
            const { barcode } = req.params

            const { rows: data } = await db.query('SELECT * FROM goods WHERE barcode = $1', [barcode])
            res.render('goods/goodedit', { item: data[0], user: req.session.user, current: 'goods', units: resut })
        } catch (err) {
            res.send(err)
        }
    })

    router.post('/edit/:barcode', async (req, res) => {
        try {
            const { barcode } = req.params
            const { name, stock, purchase, selling, unit } = req.body

            let sampleFile;
            let uploadPath;

            if (!req.files || Object.keys(req.files).length === 0) {
                await db.query('UPDATE goods SET name=$1, stock=$2, purchaseprice=$3, sellingprice=$4, unit=$5 WHERE barcode=$6',
                    [name, stock, purchase, selling, unit, barcode])
            } else {
                // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
                sampleFile = req.files.sampleFile;
                const imagefiles = `${Date.now()}-${sampleFile.name}`
                uploadPath = path.join(__dirname, '..', 'public', 'images', 'upload', imagefiles);
                sampleFile.mv(uploadPath)

                await db.query('UPDATE goods SET name=$1, stock=$2, purchaseprice=$3, sellingprice=$4, unit=$5, picture=$6 WHERE barcode=$7', [name, stock, purchase, selling, unit, imagefiles, barcode])
            }
            res.redirect('/goods')
        } catch (err) {
            res.send(err)
        }
    })

    router.get('/delete/:barcode', async (req, res) => {
        try {
            const { barcode } = req.params

            const { rows } = await db.query('DELETE FROM goods WHERE barcode = $1', [barcode])

            // const { rows: resut } = await db.query('SELECT * FROM goods')
            // const removeImg = resut[0].picture

            // fs.unlinkSync(`/public/images/upload/${removeImg}`, function (err) {
            //     console.log(err)
            // })


            res.redirect('/goods')
        } catch (err) {
            res.send(err)
        }
    })


    return router;
}