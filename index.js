const rp = require('request-promise');
const cheerio = require('cheerio');
let $;
const cloudscraper = require('cloudscraper');
const yapo_url = "https://www.yapo.cl/biobio/ofertas_de_empleo/?q=";
const keywords = ["Desarrollador", "Programador", "Informatico"];

// rp(url)
//     .then(function (html) {
//         //success!
//         console.log(html);
//     })
//     .catch(function (err) {
//         console.error(err)
//     });

function webcall(url) {
    return new Promise((resolve, reject) => {
        cloudscraper.get(url, function (error, response, body) {
            if (error) {
                reject(error)
            } else {
                resolve(body)
            }
        });
    })
}

async function main() {
    for (let i = 0; i < keywords.length; i++) {
        try {
            let body = await webcall(yapo_url + keywords[i])
            $ = cheerio.load(body);
            console.log($("tr.listing_thumbs").html())
        } catch (error) {
            console.error(error)
        }
    }
}

main()