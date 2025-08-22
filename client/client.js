const { io } = require("socket.io-client");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Digite seu nome: ", (username) => {
    if (!username.trim())
        username = "Anônimo";

    const socket = io("http://localhost:3001");

    socket.on("connect", () => {
        console.log("Bem vindo ao chat " + username);
        console.log("Envie suas mensagens ou digite /sair para encerrar");
        rl.setPrompt(">");
        rl.prompt();

        rl.on("line", (mensagem) => {
            if (!mensagem.trim()) {
                rl.prompt();
                return;
            }
            if (mensagem.toLowerCase() === "/sair") {
                console.log("Saindo do chat...");
                socket.disconnect();
                rl.close();
                process.exit(0);
            }
            socket.emit("sendMessage", username + ": " + mensagem);
            rl.prompt();
        });
    });

    socket.on("receiveMessage", (data) => {
        console.log("\n" + data);
        rl.prompt();
    });

    socket.on("disconnect", () => {
        console.log("Servidor desconectado!");
        rl.close();
    });
});