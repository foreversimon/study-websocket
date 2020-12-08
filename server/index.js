const express = require('express')
const app = express()
const expressWs = require('express-ws')(app)
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const routerWs = require('./src/websocket/index')
const routerUser = require('./src/user/index')
const port = 3000

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use('/ws', routerWs)
app.use('/user', routerUser)
app.use(cookieParser())
app.use(express.static('../web'))

app.listen(port, () => {
    console.dir(`http://localhost:${port}`)
})

