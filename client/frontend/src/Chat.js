import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function Chat() {
  const [username, setUsername] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMensagens((msgs) => [...msgs, data]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const enviarMensagem = (e) => {
    e.preventDefault();
    if (!mensagem.trim() || !username.trim()) return;
    socket.emit("sendMessage", `${username}: ${mensagem}`);
    setMensagem("");
    inputRef.current.focus();
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Chat em Tempo Real</h2>
      <input
        type="text"
        placeholder="Seu nome"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />
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
        />
        <button type="submit" style={{ width: "18%", marginLeft: "2%" }}>
          Enviar
        </button>
      </form>
    </div>
  );
}

export default Chat;