const express = require('express')
const router = express.Router()
const expressWs = require('express-ws')
const cookieParser = require('cookie-parser')
expressWs(router)
router.use(cookieParser())

global.colorCan = [
    '#FF6666',
    '#FFFF00',
    '#0066CC',
    '#CC0033',
    '#333333',
    '#CCCC00',
    '#336633',
    '#990033',
    '#FFCC99',
    '#FF6666'
]

global.users = {}

router.ws('/', (ws, req, next) => {
    const cookies = req.cookies
    const users = global.users
    ws = new Proxy(ws, {
        get(target, p, receiver) {
            if (p === 'send') {
                return function (...args) {
                    target[p].apply(receiver, args.map(item => {
                        return JSON.stringify(item)
                    }))
                }
            } else {
                return Reflect.get(target, p, receiver)
            }
        }
    })
    ws.on('connect', () => {
        console.log('abc')
    })
    ws
        .on('message', onMessage)
        .on('close', onClose)
        .on('error', onError)
    function onMessage (msg) {
        try {
            const data = JSON.parse(msg)
            if (data.type === 'onconnect') {
                users[cookies.userid] = {
                    username: cookies.username,
                    id: cookies.userid,
                    color: colorCan[Object.keys(users).length % 10 - 1],
                    ws
                }
                dispatchList(users)
            } else {
                throw Error('')
            }
        } catch (e) {
            dispatchList(users)
            dispatchMsg(users, msg, {name: cookies.username, id: cookies.userid, color: cookies.color})
        }
    }
    function onClose () {
        const name = cookies.username
        delete users[cookies.userid]
        dispatchMsg(users, '已关闭连接', {name})
        dispatchList(users)
    }
    function onError () {
        const name = cookies.username
        delete users[cookies.userid]
        dispatchMsg(users, '已关闭连接', {name})
        dispatchList(users)
    }
})

function dispatchMsg (users = {}, message, user = {name: '', id: '', color: ''}) {
    for (let keys of Object.keys(users)) {
        if (!users[keys].ws) continue
        // const msg = `[${user.name}]: ${message}`
        const msg = JSON.stringify({
            user: user.name,
            color: user.color,
            msg: message
        })
        users[keys].ws.send({type: 'msg', msg})
    }
}

function dispatchList (users = {}) {
    const newUsers = Object.keys(users).reduce((now, item) => {
        const {username, id, color} = users[item]
        now[item] = {
            username,
            id,
            color
        }
        return now
    }, {})
    for (let keys of Object.keys(users)) {
        if (!users[keys].ws) continue
        users[keys].ws.send({type: 'userList', list: newUsers})
    }
}
module.exports = router
