const yapo = require("./yapo.js");
const chiletrabajos = require("./chiletrabajos.js");

function main() {
    // yapo.get().then(offers => {
    //     console.log(offers)
    // })
    chiletrabajos.get().then(offers => {
        console.log(offers)
    })
}

main()