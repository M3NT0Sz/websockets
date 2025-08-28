import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Users, Settings, Mic, Headphones, User, Phone, Video, UserPlus } from 'lucide-react';
import { io } from 'socket.io-client';

const ChatInterface = () => {
  const [activeChannel, setActiveChannel] = useState('carros');
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('Usuário');
  const [messages, setMessages] = useState({
    carros: [],
    jogos: [],
    música: []
  });

  // Socket.io
  const socketRef = useRef();

  // Mapear canal para porta
  const channelToPort = {
    carros: 3001,
    jogos: 3002,
    música: 3003
  };

  // Sempre que o canal mudar, conectar ao servidor correto
  useEffect(() => {
    // Desconectar do socket anterior, se existir
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const port = channelToPort[activeChannel];
    socketRef.current = io(`http://localhost:${port}`);

    // Entrar na sala (opcional, caso queira manter joinRoom)
    socketRef.current.emit('joinRoom', activeChannel);

    // Receber mensagens do backend
    socketRef.current.on('receiveMessage', ({ room, message }) => {
      setMessages(prev => ({
        ...prev,
        [room]: [...(prev[room] || []), message]
      }));
    });

    // Receber histórico ao entrar na sala
    socketRef.current.on('history', ({ room, history }) => {
      setMessages(prev => {
        // Garante que history é um array
        const safeHistory = Array.isArray(history) ? history : [];
        const current = prev[room] || [];
        // Adiciona apenas mensagens que não existem ainda (por id)
        const merged = [...safeHistory];
        current.forEach(msg => {
          if (!merged.find(m => m.id === msg.id)) {
            merged.push(msg);
          }
        });
        return {
          ...prev,
          [room]: merged
        };
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line
  }, [activeChannel]);

  const channels = [
    { id: 'carros', name: 'carros', image: require('./assets/carros.jpg') },
    { id: 'jogos', name: 'jogos', image: require('./assets/jogos.jpg') },
    { id: 'música', name: 'música', image: require('./assets/musicas.jpg') }
  ];

  const friends = [
    { name: 'larihs2634', status: 'Em uma chamada', isOnline: true, avatar: '🎮' },
    { name: 'oYamanaka', status: 'Em um canal de voz', isOnline: true, avatar: '👤' },
    { name: 'Família Gamer', status: 'Call de Verdade', isOnline: true, avatar: '🎯' },
    { name: 'TeamAgo', status: 'Jogando', isOnline: true, avatar: '🎪' },
    { name: 'Little Gugas', status: 'Ausente', isOnline: false, avatar: '🎭' },
    { name: '_shadow♡', status: 'Offline', isOnline: false, avatar: '🌙' }
  ];

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChannel]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      user: username,
      message: message,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isOnline: true
    };

    // Enviar para o backend
    socketRef.current.emit('sendMessage', {
      room: activeChannel,
      message: newMessage
    });
    setMessage('');
  };

  const getChannelIcon = (channelId) => {
    const channel = channels.find(c => c.id === channelId);
    const IconComponent = channel?.icon || MessageCircle;
    return <IconComponent size={20} />;
  };

  return (
    <div className="flex h-screen bg-gray-800 text-white font-sans">
      {/* Sidebar - Servers with images */}
      <div className="w-20 bg-gray-900 flex flex-col items-center py-6 space-y-4">
        {channels.map((channel) => (
          <div
            key={channel.id}
            onClick={() => setActiveChannel(channel.id)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer shadow-lg overflow-hidden border-2 transition-all duration-200 ${
              activeChannel === channel.id ? 'border-indigo-500' : 'border-transparent hover:border-indigo-300'
            }`}
            title={channel.name}
          >
            <img
              src={channel.image}
              alt={channel.name}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>

      {/* Sidebar - Channels */}
      <div className="w-64 bg-gray-750 flex flex-col">
        <div className="p-4 border-b border-gray-600 shadow-lg">
          <h1 className="text-white font-bold text-lg">Meu Servidor</h1>
        </div>
        
        <div className="flex-1 p-4">
          <div className="mb-6">
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wide mb-2">Canais de Texto</h3>
            <div className="space-y-1">
              {channels.map(channel => (
                <div
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    activeChannel === channel.id 
                      ? 'bg-gray-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="text-gray-400">#</span>
                  <span className="text-sm font-medium">{channel.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User area com edição de perfil */}
        <div className="p-4 bg-gray-800 border-t border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <User size={16} />
              </div>
              <div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="text-sm font-medium bg-transparent border-b border-gray-600 focus:border-indigo-500 outline-none text-white w-28"
                  maxLength={20}
                  placeholder="Seu nome"
                />
                <div className="text-xs text-gray-400">Online</div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Mic size={16} className="text-gray-400 hover:text-white cursor-pointer" />
              <Headphones size={16} className="text-gray-400 hover:text-white cursor-pointer" />
              <Settings size={16} className="text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-600 bg-gray-750 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getChannelIcon(activeChannel)}
              <h2 className="text-xl font-semibold">#{activeChannel}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <Phone size={20} className="text-gray-400 hover:text-white cursor-pointer" />
              <Video size={20} className="text-gray-400 hover:text-white cursor-pointer" />
              <Users size={20} className="text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages[activeChannel]?.map((msg) => (
            <div key={msg.id} className="flex items-start space-x-3 hover:bg-gray-750 hover:bg-opacity-30 p-2 rounded-lg transition-colors duration-150">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">{msg.user.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">{msg.user}</span>
                  <span className="text-xs text-gray-400">{msg.time}</span>
                </div>
                <p className="text-gray-200 mt-1">{msg.message}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 bg-gray-750">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(e)}
                placeholder={`Conversar em #${activeChannel}`}
                className="w-full px-4 py-3 bg-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ChatInterface;