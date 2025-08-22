import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function Chat() {
  const [username, setUsername] = useState("");
  const [nomeTravado, setNomeTravado] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMensagens((msgs) => [...msgs, data]);
    });
    socket.on("nameChanged", ({ oldName, newName }) => {
      setMensagens((msgs) => [
        ...msgs,
        `⚠️ ${oldName} mudou o nome para ${newName}`,
      ]);
    });
    return () => {
      socket.off("receiveMessage");
      socket.off("nameChanged");
    };
  }, []);

  const travarNome = () => {
    if (username.trim()) setNomeTravado(true);
  };

  const enviarMensagem = (e) => {
    e.preventDefault();
    if (!mensagem.trim() || !nomeTravado) return;
    socket.emit("sendMessage", `${username}: ${mensagem}`);
    setMensagem("");
    inputRef.current.focus();
  };

  const mudarNome = () => {
    if (!novoNome.trim() || novoNome === username) return;
    socket.emit("changeName", { oldName: username, newName: novoNome });
    setMensagens((msgs) => [
      ...msgs,
      `⚠️ Você mudou seu nome para ${novoNome}`,
    ]);
    setUsername(novoNome);
    setNovoNome("");
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Chat em Tempo Real</h2>
      <input
        type="text"
        placeholder="Seu nome"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={nomeTravado}
        onBlur={travarNome}
        style={{ width: "100%", marginBottom: 8 }}
      />
      {!nomeTravado && (
        <button onClick={travarNome} style={{ marginBottom: 8 }}>
          Entrar
        </button>
      )}
      {nomeTravado && (
        <div style={{ marginBottom: 8 }}>
          <input
            type="text"
            placeholder="Novo nome"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            style={{ width: "70%" }}
          />
          <button onClick={mudarNome} style={{ width: "28%", marginLeft: "2%" }}>
            Mudar nome
          </button>
        </div>
      )}
      <div
        style={{
          border: "1px solid #ccc",
          height: 200,
          overflowY: "auto",
          marginBottom: 8,
          padding: 8,
          background: "#f9f9f9",
        }}
      >
        {mensagens.map((msg, idx) => (
          <div key={idx}>{msg}</div>
        ))}
      </div>
      <form onSubmit={enviarMensagem}>
        <input
          type="text"
          placeholder="Digite sua mensagem"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          ref={inputRef}
          style={{ width: "80%" }}
          disabled={!nomeTravado}
        />
        <button type="submit" style={{ width: "18%", marginLeft: "2%" }}>
          Enviar
        </button>
      </form>
    </div>
  );
}

export default Chat;