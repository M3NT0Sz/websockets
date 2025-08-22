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
        fontFamily: "Segoe UI, Arial, sans-serif",
        background: "#23272a"
      }}
    >
      {/* Barra lateral moderna */}
      <div
        style={{
          width: 100,
          background: "#202225",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 24,
          borderRight: "1px solid #18191c",
          boxShadow: "2px 0 8px #18191c33"
        }}
      >
        {temas.map((t) => (
          <div
            key={t.nome}
            onClick={() => mudarTema(t.nome)}
            title={t.nome}
            style={{
              cursor: "pointer",
              background: tema.nome === t.nome ? "#5865f2" : "#36393f",
              borderRadius: "50%",
              marginBottom: 24,
              width: 64,
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: tema.nome === t.nome ? "0 0 12px #5865f2" : "none",
              border: tema.nome === t.nome ? "3px solid #fff" : "3px solid #36393f",
              transition: "all 0.2s"
            }}
          >
            <img
              src={t.img}
              alt={t.nome}
              style={{
                width: 40,
                height: 40,
                objectFit: "cover",
                borderRadius: "50%"
              }}
            />
          </div>
        ))}
      </div>
      {/* Área do chat moderna */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#36393f",
        }}
      >
        {/* Topo do chat */}
        <div
          style={{
            padding: "18px 24px",
            color: "#fff",
            borderBottom: "1px solid #23272a",
            display: "flex",
            alignItems: "center",
            background: "#2f3136"
          }}
        >
          <img src={tema.img} alt={tema.nome} style={{ width: 32, height: 32, borderRadius: 8, marginRight: 16, border: "2px solid #5865f2" }} />
          <h2 style={{ margin: 0, fontWeight: 600, fontSize: 22 }}>{tema.nome}</h2>
        </div>
        {/* Mensagens com balões */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 32px 24px 32px",
            background: "#36393f",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            gap: 10
          }}
        >
          {mensagens[tema.nome].map((msg, idx) => {
            // Separa nome e texto para balão
            let nome = null;
            let texto = msg;
            if (msg.includes(": ")) {
              const split = msg.split(": ");
              nome = split[0];
              texto = split.slice(1).join(": ");
            }
            const isAviso = msg.startsWith("⚠️");
            return (
              <div key={idx} style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-end",
                marginBottom: 6,
                justifyContent: isAviso ? "center" : (nome === username ? "flex-end" : "flex-start")
              }}>
                {!isAviso && nome && (
                  <span style={{
                    fontWeight: 600,
                    color: nome === username ? "#43b581" : "#fff",
                    marginRight: 8,
                    fontSize: 15
                  }}>{nome}:</span>
                )}
                <span style={{
                  background: isAviso ? "#ffb347" : (nome === username ? "#5865f2" : "#40444b"),
                  color: isAviso ? "#23272a" : "#fff",
                  borderRadius: 16,
                  padding: isAviso ? "6px 18px" : "10px 18px",
                  fontSize: 15,
                  maxWidth: 400,
                  wordBreak: "break-word",
                  boxShadow: isAviso ? "0 0 8px #ffb34755" : "0 1px 4px #18191c33"
                }}>{texto}</span>
              </div>
            );
          })}
        </div>
        {/* Input fixo no rodapé */}
        <div style={{ background: "#2f3136", borderTop: "1px solid #23272a", padding: "16px 24px" }}>
          {!nomeTravado && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                type="text"
                placeholder="Digite seu nome"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: 220,
                  padding: 10,
                  borderRadius: 8,
                  border: "none",
                  outline: "none",
                  fontSize: 15,
                  background: "#40444b",
                  color: "#fff"
                }}
              />
              <button
                onClick={travarNome}
                style={{
                  background: "#5865f2",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 22px",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: "pointer"
                }}
              >Entrar</button>
            </div>
          )}
          {nomeTravado && (
            <form
              onSubmit={enviarMensagem}
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <input
                type="text"
                placeholder={`Mensagem em #${tema.nome}`}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                ref={inputRef}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: "none",
                  outline: "none",
                  fontSize: 15,
                  background: "#40444b",
                  color: "#fff"
                }}
              />
              <button
                type="submit"
                style={{
                  background: "#5865f2",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 22px",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: "pointer"
                }}
              >Enviar</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;