const express = require("express");
const app = express();

// const moment = require("moment");
const ip = 'https://job-finder-express.herokuapp.com';
const port = process.env.PORT || 3000

const yapo = require("./yapo.js");
const chiletrabajos = require("./chiletrabajos.js");
const computrabajo = require("./computrabajo.js");

function main() {
    return new Promise(async (resolve, reject) => {
        let offers = new Array()
        offers = offers.concat(await yapo.get())
        offers = offers.concat(await chiletrabajos.get())
        offers = offers.concat(await computrabajo.get())

        offers.sort(function (a, b) {
            return a.date - b.date
        })

        let filter_offers = new Array()
        offers.forEach(offer => {
            if (filter_offers.map(function (e) { return e.url }).indexOf(offer.url) === -1) filter_offers.push(offer)
        })
        resolve(filter_offers)
    })

    // console.log(filter_offers.map(o => { return o = { title: o.title, address: o.address, url: o.url, date: moment(o.date).format('LL') } }))

}

app.get('/', async (req, res) => {
    let offers = await main()
    res.send(offers)
})

app.listen(port, () => console.log('Escuchando en ' + ip + ":" + port))