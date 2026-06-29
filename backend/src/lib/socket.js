import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"]
    }
});

// Used to store online users
// {userId: socketId}
const userSocketMap = {};

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

io.on("connection", (socket) => {
    console.log("A User is connected: ", socket.id);

    const userId = socket.handshake.query.userId;
    // every time a new user connects his/her userId and socket.id is stored to track online users.
    if (userId) userSocketMap[userId] = socket.id;

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // when a user loses / leaves connection, only that socket is connected - not the entire server.
    // that's why " socket.on("disconnect") "
    socket.on("disconnect", () => {
        console.log("A User Disconnected: ", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, app, server };