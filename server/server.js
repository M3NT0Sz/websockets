const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server);

io.on("connection", (socket) => {
    console.log("Novo usuário conectado: " + socket.id);

    socket.on("sendMessage", (data) => {
        io.emit("receiveMessage", data);
    });

    socket.on("disconnect", () => {
        console.log("Usuário desconectado: " + socket.id);
    })
})

server.listen(3001, () => {
    console.log("Servidor rodando na porta 3001");
})