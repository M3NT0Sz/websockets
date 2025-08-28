
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

const server = http.createServer(app);

// Adicione a configuração de CORS aqui:
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // endereço do seu frontend React
        methods: ["GET", "POST"]
    }
});



// Funções utilitárias para persistência
const historyDir = path.join(__dirname, 'history');
if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir);
}

function getHistoryFile(room) {
    return path.join(historyDir, `${room}.json`);
}

function loadHistory(room) {
    const file = getHistoryFile(room);
    if (fs.existsSync(file)) {
        try {
            return JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch {
            return [];
        }
    }
    return [];
}

function saveHistory(room, history) {
    const file = getHistoryFile(room);
    fs.writeFileSync(file, JSON.stringify(history, null, 2));
}

// Histórico de mensagens em memória, mas carrega do disco ao iniciar
const messageHistory = {
    carros: loadHistory('carros'),
    jogos: loadHistory('jogos'),
    música: loadHistory('música')
};

io.on("connection", (socket) => {
    console.log("Novo usuário conectado: " + socket.id);


    socket.on("joinRoom", (room) => {
        socket.join(room);
        console.log(`Usuário ${socket.id} entrou na sala ${room}`);
        // Carregar histórico atualizado do disco
        messageHistory[room] = loadHistory(room);
        socket.emit("history", { room, history: messageHistory[room] || [] });
    });

    socket.on("sendMessage", ({ room, message }) => {
        // Salvar mensagem no histórico
        if (messageHistory[room]) {
            messageHistory[room].push(message);
        } else {
            messageHistory[room] = [message];
        }
        // Persistir no disco
        saveHistory(room, messageHistory[room]);
        io.to(room).emit("receiveMessage", { room, message });
    });

    socket.on("changeName", ({ oldName, newName, room }) => {
        io.to(room).emit("nameChanged", { oldName, newName });
    });

    socket.on("disconnect", () => {
        console.log("Usuário desconectado: " + socket.id);
    });
});

server.listen(3001, () => {
    console.log("Servidor rodando na porta 3001");
});