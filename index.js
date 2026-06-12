const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const users = {};

io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.on("register", (userId) => {
        users[userId] = socket.id;
    });

    socket.on("call-user", ({ to, offer }) => {
        const socketId = users[to];
        if (socketId) {
            io.to(socketId).emit("incoming-call", { from: socket.id, offer });
        }
    });

    socket.on("call-accepted", ({ to, answer }) => {
        io.to(to).emit("call-accepted", answer);
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
        io.to(to).emit("ice-candidate", candidate);
    });

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
