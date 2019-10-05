const path = require('path')

let typePars = process.argv[2]
let org = process.argv[3]

let adr =  path.join(__dirname, typePars, org)
require(`${adr}/index`)()