import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import jogosImg from "./assets/jogos.jpg";
import carrosImg from "./assets/carros.jpg";
import musicasImg from "./assets/musicas.jpg";

const temas = [
  { nome: "Jogos", img: jogosImg },
  { nome: "Carros", img: carrosImg },
  { nome: "Músicas", img: musicasImg },
];

const servidores = {
  Jogos: "http://localhost:3001",
  Carros: "http://localhost:3002",
  Músicas: "http://localhost:3003",
};

function Chat() {
  const [username, setUsername] = useState("");
  const [nomeTravado, setNomeTravado] = useState(false);
  const [tema, setTema] = useState(temas[0]);
  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState({
    Jogos: [],
    Carros: [],
    Músicas: [],
  });
  const [socket, setSocket] = useState(() => io(servidores[temas[0].nome]));
  const inputRef = useRef(null);

  useEffect(() => {
    // Desconecta o socket antigo e conecta no novo servidor
    socket.disconnect();
    const novoSocket = io(servidores[tema.nome]);
    setSocket(novoSocket);

    // Ao entrar na sala, pedir o histórico
    novoSocket.emit("joinRoom", tema.nome);

    novoSocket.on("history", ({ room, messages }) => {
      setMensagens((msgs) => ({
        ...msgs,
        [room]: messages,
      }));
    });

    novoSocket.on("receiveMessage", ({ room, message }) => {
      setMensagens((msgs) => ({
        ...msgs,
        [room]: [...(msgs[room] || []), message],
      }));
    });

    novoSocket.on("nameChanged", ({ oldName, newName, room }) => {
      setMensagens((msgs) => ({
        ...msgs,
        [room]: [...(msgs[room] || []), `⚠️ ${oldName} mudou o nome para ${newName}`],
      }));
    });

    return () => {
      novoSocket.off("history");
      novoSocket.off("receiveMessage");
      novoSocket.off("nameChanged");
      novoSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tema]);

  const travarNome = () => {
    if (username.trim()) setNomeTravado(true);
  };

  const enviarMensagem = (e) => {
    e.preventDefault();
    if (!mensagem.trim() || !nomeTravado) return;
    socket.emit("sendMessage", {
      room: tema.nome,
      message: `${username}: ${mensagem}`,
    });
    setMensagem("");
    inputRef.current.focus();
  };

  const mudarTema = (nomeTema) => {
    if (tema.nome !== nomeTema) {
      const temaObj = temas.find((t) => t.nome === nomeTema);
      if (temaObj) {
        setTema(temaObj);
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "sans-serif",
      }}
    >
      {/* Barra lateral */}
      <div
        style={{
          width: 120,
          background: "#23272a",
          color: "#fff",
          padding: 0,
        }}
      >
        <h3
          style={{
            textAlign: "center",
            margin: "16px 0 8px 0",
          }}
        >
          Temas
        </h3>
        {temas.map((t) => (
          <div
            key={t.nome}
            onClick={() => mudarTema(t.nome)}
            style={{
              cursor: "pointer",
              background: tema.nome === t.nome ? "#5865f2" : "transparent",
              borderRadius: 8,
              margin: "8px 8px",
              padding: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: tema.nome === t.nome ? "0 0 8px #5865f2" : "none",
              border: tema.nome === t.nome ? "2px solid #5865f2" : "2px solid transparent",
              transition: "all 0.2s"
            }}
          >
            <img
              src={t.img}
              alt={t.nome}
              style={{
                width: 60,
                height: 60,
                objectFit: "cover",
                borderRadius: 8,
                border: tema.nome === t.nome ? "2px solid #fff" : "2px solid #23272a",
                marginBottom: 4
              }}
            />
          </div>
        ))}
      </div>
      {/* Área do chat */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#36393f",
        }}
      >
        <div
          style={{
            padding: 16,
            color: "#fff",
            borderBottom: "1px solid #23272a",
            display: "flex",
            alignItems: "center"
          }}
        >
          <img src={tema.img} alt={tema.nome} style={{ width: 32, height: 32, borderRadius: 6, marginRight: 12 }} />
          <h2 style={{ margin: 0 }}>#{tema.nome}</h2>
        </div>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 16,
            background: "#2f3136",
            color: "#fff",
          }}
        >
          {mensagens[tema.nome].map((msg, idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              {msg}
            </div>
          ))}
        </div>
        {!nomeTravado && (
          <div style={{ padding: 16 }}>
            <input
              type="text"
              placeholder="Digite seu nome"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: 200, marginRight: 8 }}
            />
            <button onClick={travarNome}>Entrar</button>
          </div>
        )}
        {nomeTravado && (
          <form
            onSubmit={enviarMensagem}
            style={{
              display: "flex",
              padding: 16,
              borderTop: "1px solid #23272a",
              background: "#36393f",
            }}
          >
            <input
              type="text"
              placeholder={`Mensagem em #${tema.nome}`}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              ref={inputRef}
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 4,
                border: "none",
                outline: "none",
                marginRight: 8,
              }}
            />
            <button type="submit" style={{ padding: "8px 16px" }}>
              Enviar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Chat;