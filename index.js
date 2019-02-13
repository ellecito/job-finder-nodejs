const yapo = require("./yapo.js");
const chiletrabajos = require("./chiletrabajos.js");
const computrabajo = require("./computrabajo.js");

async function main() {
    let offers = new Array()
    offers = offers.concat(await yapo.get())
    offers = offers.concat(await chiletrabajos.get())
    offers = offers.concat(await computrabajo.get())

    console.log(offers)
}

main()