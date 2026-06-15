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

// CONNECTION
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

        console.log(
            "CALL REQUEST",
            "FROM:", from,
            "TO:", to
        );

        const socketId = users[to];

        if (socketId) {

            io.to(socketId).emit("incoming-call", {
                callerUid: from,
                callerName: callerName || "Unknown",
                offer: offer
            });

            console.log(
                "INCOMING CALL SENT TO:",
                to
            );

        } else {

            console.log(
                "USER NOT REGISTERED:",
                to
            );
        }
    });

    // CALL ACCEPTED
    socket.on("call-accepted", ({ to, answer }) => {

        console.log(
            "CALL ACCEPTED ->",
            to
        );

        const socketId = users[to];

        if (socketId) {

            io.to(socketId).emit("call-accepted", {
                answer: answer
            });

            console.log(
                "ANSWER SENT TO:",
                to
            );
        }
    });

    // ICE CANDIDATE
    socket.on("ice-candidate", ({ to, candidate }) => {
socket.on("ice-candidate", ({ to, sdpMid, sdpMLineIndex, candidate }) => {

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

        console.log(
            "Disconnected:",
            socket.id
        );

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
