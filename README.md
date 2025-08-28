# Websockets Chat App

Este projeto é um sistema de chat em tempo real com múltiplos servidores (carros, jogos, música), feito com React no frontend e Node.js + Socket.io no backend. Cada canal de chat possui seu próprio backend e histórico independente.

## Funcionalidades
- Chat em tempo real por websocket (Socket.io)
- Troca de mensagens instantânea
- Histórico de mensagens persistente (mesmo após reiniciar o servidor)
- Troca de nome de usuário (perfil)
- Interface moderna com React e Tailwind CSS
- Cada canal (carros, jogos, música) possui seu próprio servidor backend
- Imagens customizadas para cada servidor na barra lateral

## Estrutura do Projeto
```
client/
  frontend/         # React app (src/Chat.js, App.js, etc)
    src/assets/     # Imagens dos servidores
server/
  server-carros.js  # Backend do chat carros (porta 3001)
  server-jogos.js   # Backend do chat jogos (porta 3002)
  server-musicas.js # Backend do chat música (porta 3003)
```

## Como rodar

### 1. Instale as dependências

No frontend:
```bash
cd client/frontend
npm install
```
No backend (repita para cada servidor):
```bash
cd server
npm install
```

### 2. Inicie os servidores backend
Abra 3 terminais e rode:
```bash
node server-carros.js   # Porta 3001
node server-jogos.js    # Porta 3002
node server-musicas.js  # Porta 3003
```

### 3. Inicie o frontend
Em outro terminal:
```bash
cd client/frontend
npm start
```
Acesse http://localhost:3000

## Observações
- O histórico de cada chat é salvo em arquivos JSON na pasta `server/history` de cada backend.
- Para trocar de canal, basta clicar na imagem do servidor desejado na barra lateral.
- O frontend se conecta automaticamente ao backend correto conforme o canal selecionado.

## Tecnologias
- React
- Tailwind CSS
- Socket.io
- Node.js
- Express

---

Sinta-se à vontade para customizar e expandir o projeto!
