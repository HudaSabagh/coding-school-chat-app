const port = 3000;

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

// socket.io implementation
const { Server } = require('socket.io')
const io = new Server(server)

app.get('/', (req, res) => {
    // res.send('<h1>Hello Coding School</h1>')
    res.sendFile(__dirname + '/index.html')
})

const loggedInUsers = {}
let allUsersAmount = 0

// these are the same:
// loggedInUsers['newProp'] = 'Jack'
// loggedInUsers.newProp = 'Jack'

// EVENT DRIVEN !
// listening for event
io.on('connection', socket => {
    console.log('a user has connected')
    allUsersAmount += 1;
    io.emit('allUsersAmount', allUsersAmount)
    io.emit('loggedIn userNames', Object.values(loggedInUsers))
    io.emit('loggedInAmount', Object.values(loggedInUsers).length)
    socket.broadcast.emit('welcome or goodbye', 'a user has joined the chat :)')

    socket.on('login', data => {
        loggedInUsers[socket.id] = data.loginName;

        io.emit('loggedIn userNames', Object.values(loggedInUsers))
        io.emit('loggedInAmount', Object.values(loggedInUsers).length)

    })

    // listening for event
    socket.on('disconnect', () => {
        console.log('user disconnected')

        if (loggedInUsers[socket.id]) {
            console.log('disconnected user :', loggedInUsers[socket.id])
            io.emit('welcome or goodbye', loggedInUsers[socket.id] + ' has left the chat :(')
            // get rid of the user with the socket.id
            delete loggedInUsers[socket.id]
            io.emit('loggedIn userNames', Object.values(loggedInUsers))

            io.emit('loggedInAmount', Object.values(loggedInUsers).length)
        } else {
            io.emit('welcome or goodbye', 'a user has left the chat :(')
        }

        allUsersAmount -= 1;
        io.emit('allUsersAmount', allUsersAmount)
        io.emit('loggedInAmount', Object.values(loggedInUsers).length)
    })

    // listening for event
    socket.on('coding school chat message', msgData => {
        console.log('message: ', msgData)

        // emitting an event
        io.emit('server chat message', msgData)
    })
})

server.listen(port, () => console.log(`listening on http://localhost:${port}`))