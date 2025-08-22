const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Armazena o histórico de mensagens por sala
const historico = {};

io.on("connection", (socket) => {
    console.log("Novo usuário conectado: " + socket.id);

    socket.on("joinRoom", (room) => {
        socket.join(room);
        console.log(`Usuário ${socket.id} entrou na sala ${room}`);
        // Envia o histórico para o usuário que acabou de entrar
        if (historico[room]) {
            socket.emit("history", { room, messages: historico[room] });
        } else {
            historico[room] = [];
        }
    });

    socket.on("sendMessage", ({ room, message }) => {
        if (!historico[room]) historico[room] = [];
        historico[room].push(message);
        io.to(room).emit("receiveMessage", { room, message });
    });

    socket.on("changeName", ({ oldName, newName, room }) => {
        const aviso = `⚠️ ${oldName} mudou o nome para ${newName}`;
        if (!historico[room]) historico[room] = [];
        historico[room].push(aviso);
        io.to(room).emit("nameChanged", { oldName, newName, room });
    });

    socket.on("disconnect", () => {
        console.log("Usuário desconectado: " + socket.id);
    });
});

server.listen(3001, () => {
    console.log("Servidor JOGOS rodando na porta 3001");
});
