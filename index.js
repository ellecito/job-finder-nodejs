const rp = require('request-promise');
const cheerio = require('cheerio');
let $;
const cloudscraper = require('cloudscraper');
const yapo_url = "https://www.yapo.cl/biobio/ofertas_de_empleo/?q=";
const keywords = ["Desarrollador", "Programador", "Informatico"];

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
            $("#hl").find(".ad").each(function(i, elem){
                let new_offer = {
                    title: $(elem).find(".title").html(),
                    url: $(elem).find(".title").attr("href"),
                    date: $(elem).find(".date").html() + " " + $(elem).find(".hour").html(),
                    img: ($(elem).find(".image").attr("src").includes("/img/transparent.gif") ? "https://www.yapo.cl/img/home_yapo_logo.png" : $(elem).find(".image").attr("src")),
                    address: $(elem).find(".region").html() + ", " + $(elem).find(".commune").html()
                }
                console.log(new_offer)
            })
        } catch (error) {
            console.error(error)
        }
    }
}

main()