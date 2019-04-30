const cloudscraper = require('cloudscraper');
const cheerio = require('cheerio');
const moment = require('moment'); moment.locale("es");
const iconv = require('iconv-lite');

const meses = new Array("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre")

module.exports = {
    url: "https://www.yapo.cl/biobio/ofertas_de_empleo/?q=",
    keywords: ["Desarrollador", "Programador", "Informatico"],
    webcall: url => {
        return new Promise((resolve, reject) => {
            cloudscraper.get({ url: url, encoding: null }).then(response => {
                response = iconv.decode(response, 'iso-8859-1')
                resolve(response)
            }).catch(err => {
                reject(err)
            })
        })
    },
    scraping: html => {
        let $ = cheerio.load(html, { decodeEntities: false });
        let offer = null;
        let offers = new Array();
        if ($(".FailoverMessageBox").html() == null) {
            $("#hl").find(".ad").each(function (i, elem) {
                offer = {
                    title: $(elem).find(".title").html(),
                    url: $(elem).find(".title").attr("href"),
                    date: module.exports.castdate($(elem).find(".date").html() + " " + $(elem).find(".hour").html()),
                    img: ($(elem).find(".image").attr("src").includes("/img/transparent.gif") ? "https://www.yapo.cl/img/home_yapo_logo.png" : $(elem).find(".image").attr("src")),
                    address: $(elem).find(".region").html() + ", " + $(elem).find(".commune").html()
                }
                if (offers.map(function (e) { return e.url }).indexOf(offer.url) === -1) offers.push(offer) //Ofertas Repetidas
            })
        }
        return offers;
    },
    castdate: rawdate => {
        rawdate = rawdate.split(" ")
        let day, month, hour, minutes, date

        if (rawdate.length > 2) {
            day = parseInt(rawdate[0])
            day = (day < 10 ? "0" + day : day.toString())
            month = meses.findIndex(function (mes) {
                return mes.substr(0, 3) === rawdate[1]
            }) + 1
            month = (month < 10 ? "0" + month : month.toString())
            rawdate = rawdate[2].split(":")
            hour = rawdate[0]
            minutes = rawdate[1]
            date = moment(new Date().getFullYear().toString() + month + day + hour + minutes, "YYYYMMDDHHmm").valueOf()
            if (date > moment().valueOf()) date = moment(new Date().getFullYear().toString() + month + day + hour + minutes, "YYYYMMDDHHmm").subtract(1, "years").valueOf()
        } else {
            day = (new Date().getUTCDate() < 10 ? "0" + new Date().getUTCDate() : new Date().getUTCDate().toString())
            month = new Date().getMonth() + 1
            month = (month < 10 ? "0" + month : month.toString())
            hour = rawdate[1].split(":")[0]
            minutes = rawdate[1].split(":")[1]
            /*Hoy*/
            if (rawdate[0] == "Hoy") {
                date = moment(new Date().getFullYear().toString() + month + day + hour + minutes, "YYYYMMDDHHmm").valueOf()
            }
            /*Ayer*/
            if (rawdate[0] == 'Ayer') {
                date = moment(new Date().getFullYear().toString() + month + day + hour + minutes, "YYYYMMDDHHmm").subtract(1, "days").valueOf()
            }
            if (date > moment().valueOf()) date = moment(new Date().getFullYear().toString() + month + day + hour + minutes, "YYYYMMDDHHmm").subtract(1, "years").valueOf()
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