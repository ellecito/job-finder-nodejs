const rp = require('request-promise');
const cheerio = require('cheerio');
const moment = require('moment'); moment.locale("es");

const meses = new Array("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre")

module.exports = {
    url: "https://www.computrabajo.cl/ofertas-de-trabajo/?prov=9&by=publicationtime&q=",
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

        $("#p_ofertas").find(".bRS.bClick").each(function (i, elem) {
            offer = {
                title: $(elem).find(".js-o-link").html(),
                url: "https://www.computrabajo.cl" + $(elem).find(".js-o-link").attr("href"),
                date: module.exports.castdate($(elem).find(".dO").html()),
                img: ($(elem).find("img.lazy").attr("data-original") ? $(elem).find("img.lazy").attr("data-original") : "https://s.ct-stc.com/web/c/cl/img/logo_cl.png"),
                address: $(elem).find("div.w_100.fl.mtb5.lT > span").eq(1).find("a").html() + ", " + $(elem).find("div.w_100.fl.mtb5.lT > span").eq(1).find("a").eq(1).html()
            }
            if (offers.map(function (e) { return e.url }).indexOf(offer.url) === -1) offers.push(offer) //Ofertas Repetidas
        })

        return offers;
    },
    castdate: rawdate => {
        rawdate = rawdate.split(" ")
        let day, month, hour, minutes
        let date
        if (rawdate.length === 2) {
            day = parseInt(rawdate[0])
            day = (day < 10 ? "0" + day : day.toString())
            month = meses.findIndex(function (mes) {
                return mes.toLowerCase() == rawdate[1]
            }) + 1
            month = (month < 10 ? "0" + month : month.toString())
            date = moment(new Date().getFullYear().toString() + month + day, "YYYYMMDD").valueOf()
            if (date > moment().valueOf()) date = moment(new Date().getFullYear().toString() + month + day, "YYYYMMDD").subtract(1, "years").valueOf()
        } else {
            day = (new Date().getUTCDate() < 10 ? "0" + new Date().getUTCDate() : new Date().getUTCDate().toString())
            month = new Date().getMonth() + 1
            month = (month < 10 ? "0" + month : month.toString())
            hour_aux = rawdate[1].split(":")
            hour = hour_aux[0]
            minutes = hour_aux[1]
            if (rawdate[0] == "Hoy,") {
                date = moment(new Date().getFullYear().toString() + month + day + hour + minutes, "YYYYMMDDHHmm").valueOf()
            }
            if (rawdate[0] == "Ayer,") {
                date = moment(new Date().getFullYear().toString() + month + day + hour + minutes, "YYYYMMDDHHmm").subtract(1, "days").valueOf()
            }
            if (date > moment().valueOf()) date = moment(new Date().getFullYear().toString() + month + day + hour + minutes, "YYYYMMDDHHmm").subtract(1, "years").valueOf()
            if (rawdate[2] == "pm" && parseInt(hour) < 12) date = moment(new Date().getFullYear().toString() + month + day + hour + minutes, "YYYYMMDDHHmm").add(12, "hours").valueOf()
        }
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
        /*Ordenamiento por fecha */
        offers.sort(function (a, b) {
            return b.date - a.date
        })

        return offers
    }
}