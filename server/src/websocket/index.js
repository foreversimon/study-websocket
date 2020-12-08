const express = require('express')
const router = express.Router()
const expressWs = require('express-ws')
const cookieParser = require('cookie-parser')
expressWs(router)
router.use(cookieParser())

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
        .on('message', (msg) => {
            try {
                const data = JSON.parse(msg)
                if (data.type === 'onconnect') {
                    users[cookies.userid] = {
                        username: cookies.username,
                        id: cookies.userid,
                        ws
                    }
                    dispatchList(users)
                } else {
                    throw Error('')
                }
            } catch (e) {
                dispatchList(users)
                dispatchMsg(users, msg, {name: cookies.username, id: cookies.userid})
            }
        })
        .on('close', () => {
            delete users[cookies.userid]
            dispatchList(users)
        })
        .on('error', () => {
            delete users[cookies.userid]
        })
})

function dispatchMsg (users = {}, message, user = {name: '', id: ''}) {
    for (let keys of Object.keys(users)) {
        if (!users[keys].ws) continue
        const msg = `[${user.name}]: ${message}`
        users[keys].ws.send({type: 'msg', msg})
    }
}

function dispatchList (users = {}) {
    const newUsers = Object.keys(users).reduce((now, item) => {
        const {username, id} = users[item]
        now[item] = {
            username,
            id
        }
        return now
    }, {})
    for (let keys of Object.keys(users)) {
        if (!users[keys].ws) continue
        users[keys].ws.send({type: 'userList', list: newUsers})
    }
}
module.exports = router
