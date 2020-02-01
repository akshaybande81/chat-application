const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");


const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app); // this can be skipped if no sockets are used express do it in the backend 
const io = socketio(server); // pass the raw server
app.use(express.static(path.join(__dirname, "../public")));

let count = 0;

// attach a event to socket
io.on(`connection`, (socket) => {

    socket.on('join', ({ username, room }, callback) => {
        // when user joins the room data = {username, room}
        socket.join(room);
        let { error, user } = addUser({ id: socket.id, username, room });
        if (error) {
            return callback(error);
        }
        socket.emit('message', generateMessage("Admin", `Welcome to ${user.room}!`));
        socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `New user ${user.username} has joined`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback();

        // socket.emit, io.emit, socket.broadcast.emit
        // io.to.emit, socket.broadcast.to.emit
    })

    socket.on('sendMessage', (data, callback) => {

        // check message for bad words

        let user = getUser(socket.id);

        let filter = new Filter();
        if (filter.isProfane(data)) {
            return callback("No profanity allowed!");
        }

        io.to(user.room).emit('message', generateMessage(user.username, data));

        callback();
    })

    socket.on("sendLocation", (data, callback) => {
        console.log(data);
        let user = getUser(socket.id);
        io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, `https://www.google.com/maps?q=${data.latitude},${data.longitude}`));
        callback();
    })

    socket.on('disconnect', () => {

        const { user } = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage("Admin", `Oops! user ${user.username} has left`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })


})


server.listen(port, (err, resp) => {
    if (err)
        return console.log("Error while creating the server");
    console.log(`Server is listening on port ${port}`);
})
