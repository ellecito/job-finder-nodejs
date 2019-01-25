const yapo = require("./yapo.js")

function main() {
    yapo.get().then(offers => {
        console.log(offers)
    })
}

main()