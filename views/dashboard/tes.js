var sales = [
    { monthly: "Nov 22", forsort: "11 22", totalsales: "164000.00" },
    { monthly: "Dec 22", forsort: "12 22", totalsales: "80000.00" }
]
var purchases = [
    { monthly: "Oct 22", forsort: "10 22", totalpurch: "60000.00" },
    { monthly: "Nov 22", forsort: "11 22", totalpurch: "39000.00" },
    { monthly: "Dec 22", forsort: "12 22", totalpurch: "60000.00" }
]

var data = purchases.concat(sales)

var newdata = {}
data.forEach(item => {
    if (newdata[item.forsort]) {
        newdata[item.forsort] = { monthly: item.monthly, expense: item.totalpurch ? item.totalpurch : newdata[item.forsort].expense, revenue: item.totalsales ? item.totalsales : newdata[item.forsort].revenue }

    } else {
            

    }
})
let result = []
for (const key in newdata) {

    result.push(newdata[key])


}
console.log(result)
