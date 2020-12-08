const express = require('express')
const router = express.Router()

router
    .post('/login', Login)

function Login (req, res) {
    const {userid, username} = req.body
    res.cookie('userid', userid, {
        maxAge: Date.now() + 86400000
    })
    res.cookie('username', username, {
        maxAge: Date.now() + 86400000
    })
    global.users[userid] = {
        username,
        id: userid
    }
    res.send({
        code: '10000',
        msg: 'success',
        list: global.users
    })
}
module.exports = router
