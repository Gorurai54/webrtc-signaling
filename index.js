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

    // REGISTER
    socket.on("register", (userId) => {

        users[userId] = socket.id;

        console.log(
            "Registered User:",
            userId,
            "Socket:",
            socket.id
        );
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

            io.to(socketId).emit("call-accepted", {
                answer: answer
            });
        }
    });

    // CALL REJECTED
    socket.on("call-rejected", ({ to }) => {

        const socketId = users[to];

        if (socketId) {

            io.to(socketId).emit("call-rejected");
        }
    });

    // END CALL
    socket.on("end-call", ({ to }) => {

        const socketId = users[to];

        if (socketId) {

            io.to(socketId).emit("end-call");
        }
    });

    // ICE CANDIDATE
    socket.on("ice-candidate", ({
        to,
        sdpMid,
        sdpMLineIndex,
        candidate
    }) => {

        console.log("ICE HIT SERVER");

        const socketId = users[to];

        if (socketId) {

            io.to(socketId).emit("ice-candidate", {
                sdpMid,
                sdpMLineIndex,
                candidate
            });
        }
    });

    // DISCONNECT
    socket.on("disconnect", () => {

        console.log("Disconnected:", socket.id);

        for (const uid in users) {

            if (users[uid] === socket.id) {

                delete users[uid];

                console.log(
                    "Removed User:",
                    uid
                );

                break;
            }
        }
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Server running");
});
