const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users (optional, for future features)
const connectedUsers = new Set();

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    connectedUsers.add(socket.id);
    
    // Notify everyone that a new user joined
    io.emit('user count', connectedUsers.size);
    
    // Handle when a user sends a message
    socket.on('chat message', (data) => {
        // Broadcast the message to all connected clients
        io.emit('chat message', {
            username: data.username,
            message: data.message,
            timestamp: new Date().toLocaleTimeString()
        });
    });
    
    // Handle when a user is typing
    socket.on('typing', (username) => {
        socket.broadcast.emit('typing', username);
    });
    
    // Handle when user stops typing
    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing');
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        connectedUsers.delete(socket.id);
        io.emit('user count', connectedUsers.size);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Chat server running on http://localhost:${PORT}`);
});
