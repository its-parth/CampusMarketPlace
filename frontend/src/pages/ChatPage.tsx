import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Conversation, Message } from '../types';
import { MessageSquare, Send, ShieldCheck, ShoppingBag, Loader2, ArrowLeft } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';

export const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialConvId = searchParams.get('conversationId');

  const { user } = useSelector((state: RootState) => state.auth);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    // Connect to WebSocket server (proxied via Vite /socket.io)
    const socket = io(window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : ''), {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Socket connected to server:', socket.id);
    });

    socket.on('receive_message', (incomingMessage: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === incomingMessage.id)) return prev;
        return [...prev, incomingMessage];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch Conversations list
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await api.get('/conversations');
        const list: Conversation[] = res.data.data || [];
        setConversations(list);

        if (initialConvId) {
          const matched = list.find((c) => c.id === parseInt(initialConvId));
          if (matched) setSelectedConv(matched);
          else if (list.length > 0) setSelectedConv(list[0]);
        } else if (list.length > 0 && !selectedConv) {
          setSelectedConv(list[0]);
        }
      } catch (err) {
        console.error('Failed to load chat conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [initialConvId]);

  // Fetch Messages for selected conversation & Join Socket Room
  useEffect(() => {
    if (!selectedConv) return;

    const loadMessages = async () => {
      try {
        const res = await api.get(`/conversations/${selectedConv.id}/messages`);
        setMessages(res.data.data || []);

        if (socketRef.current) {
          socketRef.current.emit('join_room', `conversation_${selectedConv.id}`);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    loadMessages();
  }, [selectedConv]);

  // Auto scroll ONLY the messages container (Prevents browser window auto-scroll bug)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedConv || sending) return;

    setSending(true);
    const text = newMessageText.trim();
    setNewMessageText('');

    try {
      const res = await api.post(`/conversations/${selectedConv.id}/messages`, {
        message_text: text
      });

      const sentMsg = res.data.data;
      
      // Update local messages if not already added by socket
      setMessages((prev) => {
        if (prev.some((m) => m.id === sentMsg.id)) return prev;
        return [...prev, sentMsg];
      });

      // Emit socket message event
      if (socketRef.current) {
        socketRef.current.emit('send_message', sentMsg);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading student conversations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-elevated h-[80vh] flex overflow-hidden">
        
        {/* Left Panel: Conversations List */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
          
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-600" /> Student Messages
            </h2>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {conversations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                <p>No active conversations yet.</p>
                <p className="text-[11px] text-slate-500">Find an item in the marketplace and click "Message Seller" to start trading.</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full text-left p-4 hover:bg-slate-50 flex items-start gap-3 transition-colors ${selectedConv?.id === conv.id ? 'bg-brand-50/70 border-l-4 border-brand-600' : ''}`}
                >
                  <img
                    src={conv.other_user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={conv.other_user_name}
                    className="w-10 h-10 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                        {conv.other_user_name}
                        {conv.other_user_verification === 'VERIFIED' && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-brand-600 truncate mt-0.5">
                      Inquiry: {conv.product_title}
                    </p>

                    <p className="text-xs text-slate-500 truncate mt-1">
                      {conv.last_message || 'Start conversation...'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

        </div>

        {/* Right Panel: Active Chat Thread */}
        <div className={`flex-1 flex flex-col bg-slate-50/50 ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
          
          {selectedConv ? (
            <>
              {/* Thread Header with Product Context */}
              <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConv(null)}
                    className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <img
                    src={selectedConv.product_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80'}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  />

                  <div>
                    <Link
                      to={`/products/${selectedConv.product_id}`}
                      className="text-xs font-bold text-slate-900 hover:text-brand-600 flex items-center gap-1"
                    >
                      {selectedConv.product_title}
                      <span className="text-brand-600 font-extrabold">₹{selectedConv.product_price}</span>
                    </Link>
                    <p className="text-[11px] text-slate-500">
                      Chatting with <strong className="text-slate-700">{selectedConv.other_user_name}</strong>
                    </p>
                  </div>
                </div>

                <Link
                  to={`/products/${selectedConv.product_id}`}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> View Listing
                </Link>
              </div>

              {/* Messages Area - Internal Scroll Container Only */}
              <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((msg) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs space-y-1 ${isMe ? 'bg-brand-600 text-white rounded-br-none shadow-sm' : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-subtle'}`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.message_text}</p>
                        <p className={`text-[9px] text-right ${isMe ? 'text-brand-200' : 'text-slate-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Message ${selectedConv.other_user_name}...`}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 text-xs bg-slate-100 border border-transparent focus:border-brand-500 focus:bg-white rounded-xl px-4 py-2.5 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessageText.trim() || sending}
                  className="p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md disabled:opacity-40 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-700">Select a conversation to start chatting</h3>
              <p className="text-xs max-w-xs">Chat directly with campus buyers and sellers to negotiate prices and agree on quad meetups.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
