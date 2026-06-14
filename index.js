const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" }
});

const users = {};

// CONNECT
io.on("connection", (socket) => {

    console.log("Connected:", socket.id);

    // REGISTER USER
    socket.on("register", (userId) => {
        users[userId] = socket.id;
        console.log("Registered:", userId, socket.id);
    });

    // CALL USER
    socket.on("call-user", ({ to, offer, from, callerName }) => {

        const socketId = users[to];

        if (socketId) {
            io.to(socketId).emit("incoming-call", {
                callerUid: from,
                callerName: callerName || "Unknown",
                offer: offer
            });
        }
    });

    // CALL ACCEPTED
    socket.on("call-accepted", ({ to, answer }) => {
        const socketId = users[to];
        if (socketId) {
            io.to(socketId).emit("call-accepted", answer);
        }
    });

    // ICE
    socket.on("ice-candidate", ({ to, candidate }) => {
        const socketId = users[to];
        if (socketId) {
            io.to(socketId).emit("ice-candidate", candidate);
        }
    });

    // DISCONNECT
    socket.on("disconnect", () => {
        for (let id in users) {
            if (users[id] === socket.id) {
                delete users[id];
                break;
            }
        }
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Server running");
});
