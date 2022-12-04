var express = require('express');
var router = express.Router();
const { isLoggedIn } = require('../helpers/util')


/* GET home page. */
module.exports = function (db) {
  router.get('/', isLoggedIn, async function (req, res, next) {
    try {
      const { startDate, endDate } = req.query
      const { rows: purhcases } = await db.query('SELECT sum(totalsum) FROM purchases')
      const { rows: sales } = await db.query('SELECT sum(totalsum) FROM sales')
      const { rows: customers } = await db.query('SELECT COUNT(*) from sales')

      if (!startDate && !endDate) {
        const { rows: totalpurch } = await db.query("SELECT to_char(time, 'Mon YY') AS monthly, to_char(time, 'MM YY') AS forsort, sum(totalsum) AS totalpurch FROM purchases GROUP BY monthly, forsort ORDER BY forsort")
        const { rows: totalsales } = await db.query("SELECT to_char(time, 'Mon YY') AS monthly, to_char(time, 'MM YY') AS forsort, sum(totalsum) AS totalsales FROM sales GROUP BY monthly, forsort ORDER BY forsort")
        let data = totalpurch.concat(totalsales)
        let newData = {}
        let getData = []

        data.forEach(item => {
          if (newData[item.forsort]) {
            newData[item.forsort] = { monthly: item.monthly, expense: item.totalpurch ? item.totalpurch : newData[item.forsort].expense, revenue: item.totalsales ? item.totalsales : newData[item.forsort].revenue }
          } else {
            newData[item.forsort] = { monthly: item.monthly, expense: item.totalpurch ? item.totalpurch : 0, revenue: item.totalsales ? item.totalsales : 0 }
          }
        });

        for (const key in newData) {
          getData.push(newData[key])
        }

        res.render('dashboard/dashboard', { user: req.session.user, current: 'dashboard', purhcases, query: req.query, sales, customers, getData });

      } else if (startDate) {
        const { rows: totalpurch } = await db.query("SELECT to_char(time, 'Mon YY') AS monthly, to_char(time, 'MM YY') AS forsort, sum(totalsum) AS totalpurch FROM purchases WHERE time >= $1 GROUP BY monthly, forsort ORDER BY forsort", [startDate])
        const { rows: totalsales } = await db.query("SELECT to_char(time, 'Mon YY') AS monthly, to_char(time, 'MM YY') AS forsort, sum(totalsum) AS totalsales FROM sales WHERE time >= $1 GROUP BY monthly, forsort ORDER BY forsort", [startDate])
        let data = totalpurch.concat(totalsales)
        let newData = {}
        let getData = []

        data.forEach(item => {
          if (newData[item.forsort]) {
            newData[item.forsort] = { monthly: item.monthly, expense: item.totalpurch ? item.totalpurch : newData[item.forsort].expense, revenue: item.totalsales ? item.totalsales : newData[item.forsort].revenue }
          } else {
            newData[item.forsort] = { monthly: item.monthly, expense: item.totalpurch ? item.totalpurch : 0, revenue: item.totalsales ? item.totalsales : 0 }
          }
        });

        for (const key in newData) {
          getData.push(newData[key])
        }

        res.render('dashboard/dashboard', { user: req.session.user, current: 'dashboard', purhcases, query: req.query, sales, customers, getData });

      } else if (endDate) {
        const { rows: totalpurch } = await db.query("SELECT to_char(time, 'Mon YY') AS monthly, to_char(time, 'MM YY') AS forsort, sum(totalsum) AS totalpurch FROM purchases WHERE time <= $1 GROUP BY monthly, forsort ORDER BY forsort", [endDate])
        const { rows: totalsales } = await db.query("SELECT to_char(time, 'Mon YY') AS monthly, to_char(time, 'MM YY') AS forsort, sum(totalsum) AS totalsales FROM sales WHERE time <= $1 GROUP BY monthly, forsort ORDER BY forsort", [endDate])
        let data = totalpurch.concat(totalsales)
        let newData = {}
        let getData = []

        data.forEach(item => {
          if (newData[item.forsort]) {
            newData[item.forsort] = { monthly: item.monthly, expense: item.totalpurch ? item.totalpurch : newData[item.forsort].expense, revenue: item.totalsales ? item.totalsales : newData[item.forsort].revenue }
          } else {
            newData[item.forsort] = { monthly: item.monthly, expense: item.totalpurch ? item.totalpurch : 0, revenue: item.totalsales ? item.totalsales : 0 }
          }
        });

        for (const key in newData) {
          getData.push(newData[key])
        }

        res.render('dashboard/dashboard', { user: req.session.user, current: 'dashboard', purhcases, query: req.query, sales, customers, getData });

      } else {
        const { rows: totalpurch } = await db.query("SELECT to_char(time, 'Mon YY') AS monthly, to_char(time, 'MM YY') AS forsort, sum(totalsum) AS totalpurch FROM purchases WHERE time BETWEEN $1 AND $2 GROUP BY monthly, forsort ORDER BY forsort", [startDate, endDate])
        const { rows: totalsales } = await db.query("SELECT to_char(time, 'Mon YY') AS monthly, to_char(time, 'MM YY') AS forsort, sum(totalsum) AS totalsales FROM sales WHERE BETWEEN $1 AND $2 GROUP BY monthly, forsort ORDER BY forsort", [startDate, endDate])
        let data = totalpurch.concat(totalsales)
        let newData = {}
        let getData = []

        data.forEach(item => {
          if (newData[item.forsort]) {
            newData[item.forsort] = { monthly: item.monthly, expense: item.totalpurch ? item.totalpurch : newData[item.forsort].expense, revenue: item.totalsales ? item.totalsales : newData[item.forsort].revenue }
          } else {
            newData[item.forsort] = { monthly: item.monthly, expense: item.totalpurch ? item.totalpurch : 0, revenue: item.totalsales ? item.totalsales : 0 }
          }
        });

        for (const key in newData) {
          getData.push(newData[key])
        }

        res.render('dashboard/dashboard', { user: req.session.user, current: 'dashboard', purhcases, query: req.query, sales, customers, getData });
      }
    } catch (err) {
      res.send(err)
    }
  });




  router.get('/revsource', isLoggedIn, async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query
      console.log(startDate, endDate)


      if (!startDate && !endDate) {
        const { rows: direct } = await db.query('SELECT COUNT(*) FROM sales WHERE customer = 1')
        const { rows: member } = await db.query('SELECT COUNT(*) FROM sales WHERE customer != 1')
        const { rows: totalpurch } = await db.query("SELECT to_char(time, 'Mon YY') AS monthly, to_char(time, 'MM YY') AS forsort, sum(totalsum) AS totalpurch FROM purchases GROUP BY monthly, forsort ORDER BY forsort")
        const { rows: totalsales } = await db.query("SELECT to_char(time, 'Mon YY') AS monthly, to_char(time, 'MM YY') AS forsort, sum(totalsum) AS totalsales FROM sales GROUP BY monthly, forsort ORDER BY forsort")


        let data = totalpurch.concat(totalsales)
        let newData = {}
        let hasilPendapatan = []
        let getBulan = []

        data.forEach(item => {
          if (newData[item.forsort]) {
            newData[item.forsort] = { monthly: item.monthly, expense: item.totalpurch ? item.totalpurch : newData[item.forsort].expense, revenue: item.totalsales ? item.totalsales : newData[item.forsort].revenue }
          } else {
            newData[item.forsort] = { monthly: item.monthly, expense: item.totalpurch ? item.totalpurch : 0, revenue: item.totalsales ? item.totalsales : 0 }
          }
        });


        for (const key in newData) {
          getBulan.push(newData[key].monthly)
        }

        for (const key in newData) {
          hasilPendapatan.push(Number(newData[key].revenue) - Number(newData[key].expense))
        }

        res.json({ member, direct, hasilPendapatan, getBulan })

      } else if (startDate) {
        const { rows: direct } = await db.query('SELECT COUNT(*) FROM sales WHERE customer =1 AND time >= $1 ', [startDate])
        const { rows: member } = await db.query('SELECT COUNT(*) FROM sales WHERE customer !=1 AND time >= $1', [startDate])
        const { rows: totalpurch } = await db.query("SELECT to_char(time, 'Mon YY') AS monthly, to_char(time, 'MM YY') AS forsort, sum(totalsum) AS totalpurch FROM purchases WHERE time >= $1 GROUP BY monthly, forsort ORDER BY forsort", [startDate])
        const { rows: totalsales } = await db.query("SELECT to_char(time, 'Mon YY') AS monthly, to_char(time, 'MM YY') AS forsort, sum(totalsum) AS totalsales FROM sales WHERE time >= $1 GROUP BY monthly, forsort ORDER BY forsort", [startDate])
        let data = totalpurch.concat(totalsales)
        let newData = {}
        let hasilPendapatan = []
        let getBulan = []

        data.forEach(item => {
          if (newData[item.forsort]) {
            newData[item.forsort] = { monthly: item.monthly, expense: item.totalpurch ? item.totalpurch : newData[item.forsort].expense, revenue: item.totalsales ? item.totalsales : newData[item.forsort].revenue }
          } else {
            newData[item.forsort] = { monthly: item.monthly, expense: item.totalpurch ? item.totalpurch : 0, revenue: item.totalsales ? item.totalsales : 0 }
          }
        });


        for (const key in newData) {
          getBulan.push(newData[key].monthly)
        }

        for (const key in newData) {
          hasilPendapatan.push(Number(newData[key].revenue) - Number(newData[key].expense))
        }

        res.json({ member, direct, hasilPendapatan, getBulan })


      } else if (endDate) {
        const { rows: direct } = await db.query('SELECT COUNT(*) FROM sales WHERE customer =1 AND time <= $1 ', [endDate])
        const { rows: member } = await db.query('SELECT COUNT(*) FROM sales WHERE customer !=1 AND time <= $1', [endDate])
        const { rows: totalpurch } = await db.query("SELECT to_char(time, 'Mon YY') AS monthly, to_char(time, 'MM YY') AS forsort, sum(totalsum) AS totalpurch FROM purchases WHERE time <= $1 GROUP BY monthly, forsort ORDER BY forsort", [endDate])
        const { rows: totalsales } = await db.query("SELECT to_char(time, 'Mon YY') AS monthly, to_char(time, 'MM YY') AS forsort, sum(totalsum) AS totalsales FROM sales WHERE time <= $1 GROUP BY monthly, forsort ORDER BY forsort", [endDate])


        let data = totalpurch.concat(totalsales)
        let newData = {}
        let hasilPendapatan = []
        let getBulan = []

        data.forEach(item => {
          if (newData[item.forsort]) {
            newData[item.forsort] = { monthly: item.monthly, expense: item.totalpurch ? item.totalpurch : newData[item.forsort].expense, revenue: item.totalsales ? item.totalsales : newData[item.forsort].revenue }
          } else {
            newData[item.forsort] = { monthly: item.monthly, expense: item.totalpurch ? item.totalpurch : 0, revenue: item.totalsales ? item.totalsales : 0 }
          }
        });


        for (const key in newData) {
          getBulan.push(newData[key].monthly)
        }

        for (const key in newData) {
          hasilPendapatan.push(Number(newData[key].revenue) - Number(newData[key].expense))
        }

        res.json({ member, direct, hasilPendapatan, getBulan })

      } else {
        console.log('masuk')
        const { rows: direct } = await db.query('SELECT COUNT(*) FROM sales WHERE customer =1 AND time BETWEEN $1 AND $2', [startDate, endDate])
        const { rows: member } = await db.query('SELECT COUNT(*) FROM sales WHERE customer !=1 AND time BETWEEN $1 AND $2', [startDate, endDate])
        const { rows: totalpurch } = await db.query("SELECT to_char(time, 'Mon YY') AS monthly, to_char(time, 'MM YY') AS forsort, sum(totalsum) AS totalpurch FROM purchases WHERE time BETWEEN $1 AND $2 GROUP BY monthly, forsort ORDER BY forsort", [startDate, endDate])
        const { rows: totalsales } = await db.query("SELECT to_char(time, 'Mon YY') AS monthly, to_char(time, 'MM YY') AS forsort, sum(totalsum) AS totalsales FROM sales WHERE time BETWEEN $1 AND $2 GROUP BY monthly, forsort ORDER BY forsort", [startDate, endDate])


        let data = totalpurch.concat(totalsales)
        let newData = {}
        let hasilPendapatan = []
        let getBulan = []

        data.forEach(item => {
          if (newData[item.forsort]) {
            newData[item.forsort] = { monthly: item.monthly, expense: item.totalpurch ? item.totalpurch : newData[item.forsort].expense, revenue: item.totalsales ? item.totalsales : newData[item.forsort].revenue }
          } else {
            newData[item.forsort] = { monthly: item.monthly, expense: item.totalpurch ? item.totalpurch : 0, revenue: item.totalsales ? item.totalsales : 0 }
          }
        });


        for (const key in newData) {
          getBulan.push(newData[key].monthly)
        }

        for (const key in newData) {
          hasilPendapatan.push(Number(newData[key].revenue) - Number(newData[key].expense))
        }

        res.json({ member, direct, hasilPendapatan, getBulan })
      }
    } catch (err) {
      res.send(err)
    }
  })
  return router;
}


