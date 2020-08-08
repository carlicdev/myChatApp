const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Settings
app.set('PORT', process.env.PORT || 5000);

app.use(cors());

// Serve React static files
app.use(express.static(path.join(__dirname, './client/build')));

// Routes
app.get('/', (req, res) => {
    res.send('Hello world');
});

// Socket.io
io.on('connection', socket => {
    console.log(`conect: ${socket.id}`)

    // Login
    socket.on('login', (data) => {
        
        //making sure socket has not username and has selected a room
        if (socket.username) {
            return ;
        }
        if (!data.room) {
            return ;
        }

        // single socket settings
        socket.username = data.username;
        socket.room = data.room;

        // sending back info to single socket
        io.to(socket.id).emit('login', {
            username: socket.username, 
            room: socket.room
        });

        // socket joining room
        socket.join(data.room);

        // sending an Admin message
        socket.to(socket.room).emit('server message', {
            username: 'Admin',
            message: `${socket.username} has joined the room.`
        });
    });

    // Message
    socket.on('message', message => {
        io.to(socket.room).emit('message', {
            message: message,
            username: socket.username,
        });
    })

    //Disconnect
    socket.on('disconnect', () => {
        socket.to(socket.room).emit('server message', {
            username: 'Admin',
            message: `${socket.username} has left the room.`
        })
    });
});

// Start server
http.listen(app.get('PORT'), () => {
    console.log(`Server on PORT: ${app.get('PORT')}`);
});