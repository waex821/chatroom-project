const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);

const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname + "/public")));

/*用戶陣列*/
let users = [];

// 監聽連線狀態
io.on('connection', function (socket) {
    /*是否為新用戶*/
    let isNewPerson = true;
    /*當前登入用戶*/
    let username = null;

    //監聽登入
    socket.on('login', function (data) {
        for (var i = 0; i < users.length; i++) {
            isNewPerson = (users[i].username === data.username) ? false : true;
        }
        if (isNewPerson) {
            username = data.username
            users.push({
                username: data.username
            })
            data.userCount = users.length
            /*發送 登入成功 事件*/
            socket.emit('loginSuccess', data)
            /*向所有連接的用戶廣播 add 事件*/
            io.sockets.emit('add', data)
        } else {
            /*發送 登入失敗 事件*/
            socket.emit('loginFail', '')
        }
    })
    //監聽登出
    socket.on('logout', function () {
        /* 發送 離開成功 事件 */
        socket.emit('leaveSuccess')
        users.map(function (val, index) {
            if (val.username === username) {
                users.splice(index, 1);
            }
        })
        /* 向所有連接的用戶廣播 有人登出 */
        io.sockets.emit('leave', { username: username, userCount: users.length })
    })

    /*監聽發送訊息*/
    socket.on('sendMessage', function (data) {
        /*發送receiveMessage事件*/
        io.sockets.emit('receiveMessage', data)
    })
})

var port = 5000;
server.listen(port);

console.log('server listen at ' + port)
