const rp = require('request-promise');
const cheerio = require('cheerio');
const moment = require('moment'); moment.locale("es");

const meses = new Array("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre")

module.exports = {
    url: "https://www.chiletrabajos.cl/encuentra-un-empleo/?13=1035&f=2&2=",
    keywords: ["Desarrollador", "Programador", "Informatico"],
    webcall: url => {
        return new Promise((resolve, reject) => {
            rp(url).then(html => { resolve(html) }).catch(err => { reject(err) })
        })
    },
    scraping: html => {
        let $ = cheerio.load(html, { decodeEntities: false });
        let offer = null;
        let offers = new Array();

        let cant_offers = parseInt($(".title-lines > h2").html().trim().split(" ")[0])
        let offer_address = ""
        let offer_date = ""
        if (cant_offers > 0) {
            $(".col-sm-6.page-content.mb30").find(".job-item").each(function (i, elem) {
                offer = {
                    title: $(elem).find(".title > a").html(),
                    url: $(elem).find(".title > a").attr("href"),
                    date: module.exports.castdate($(elem).find("h3.meta").eq(1).find("a").html().replace(/<\/?[^>]+(>|$)/g, "").replace(",", "").trim().replace(/ +(?= )/g, '')),
                    img: "https://s3.amazonaws.com/cht2/public/img/ch/featured.png",
                    address: $(elem).find("h3.meta").eq(0).find("a").html()
                }
                if (offers.map(function (e) { return e.url }).indexOf(offer.url) === -1) offers.push(offer) //Ofertas Repetidas
                if (i == cant_offers - 1) return false;
            })
        }

        return offers;
    },
    castdate: rawdate => {
        rawdate = rawdate.split(" ")
        let day = rawdate[0]
        let month = meses.findIndex(function (mes) {
            return mes.toLowerCase() == rawdate[2].toLowerCase()
        }) + 1
        month = (month < 10 ? "0" + month : month.toString())
        let year = rawdate[4]
        let date = moment(year + month + day, "YYYYMMDD").valueOf()
        return date
    },
    get: async () => {
        let offers = new Array();
        let body;
        for (let i = 0; i < module.exports.keywords.length; i++) {
            try {
                body = await module.exports.webcall(module.exports.url + module.exports.keywords[i])
                offers = offers.concat(module.exports.scraping(body))
            } catch (error) {
                console.error(error)
            }
        }
        return offers
    }
}