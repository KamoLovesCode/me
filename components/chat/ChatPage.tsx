"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import FloatingVoiceAssistant from "@/components/FloatingVoiceAssistant";
import { Hash, ArrowLeft, Search, MoreVertical, X } from "lucide-react";

// Message type for chat messages
interface Message {
  id: number;
  text: string;
  from: string;
  to?: string;
  time?: number;

export default function ChatPage() {
  // PeerChatSystem is loaded dynamically
  const PeerChatSystemRef = useRef<any>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        PeerChatSystemRef.current = require("@/lib/peer-chat").default;
      } catch (error) {
        console.warn("Peer chat system not available:", error);
      }
    }
  }, []);

  // State declarations
  const [user, setUser] = useState<string>("");
  const [users, setUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [to, setTo] = useState<string>("all");
  const [userColor, setUserColor] = useState<string>("");
  const [onlineUsers, setOnlineUsers] = useState<Array<{ name: string; color: string; email: string; phone: string }>>([]);
  const [pendingRequests, setPendingRequests] = useState<Array<{ from: string; to: string; message: string; id: string }>>([]);
  const [allowedContacts, setAllowedContacts] = useState<string[]>([]);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<{ from: string; message: string; id: string } | null>(null);
  const [topic, setTopic] = useState("");
  const [showTopicInput, setShowTopicInput] = useState(false);
  const [topicInput, setTopicInput] = useState("");
  const [phonebook, setPhonebook] = useState<Array<{ id: string; name: string; email: string; phone: string; company: string; joinedAt: string; color?: string }>>([]);
  const [showUserRegistration, setShowUserRegistration] = useState(false);
  const [registrationErrors, setRegistrationErrors] = useState<string[]>([]);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; phone: string; company: string }>({ name: "", email: "", phone: "", company: "" });
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPhonebook, setShowPhonebook] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const chatSystem = useRef<any>(null);


  // Load chat history for this user from localStorage - but always require re-registration
  useEffect(() => {
    localStorage.removeItem("chat-username");
    localStorage.removeItem("user-color");
    setShowUserRegistration(true);
  }, []);


  // Connect to Peer Chat System
  useEffect(() => {
    return () => {
      if (chatSystem.current) {
        chatSystem.current.leave();
        chatSystem.current = null;
      }
    };
  }, [user]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleVoiceTranscript = (transcript: string) => {
    if (chatSystem.current && user) {
      const success = chatSystem.current.sendMessage(to, `🎤 ${transcript}`);
      if (!success) {
        console.log("Voice message requires permission or failed to send");
      }
    }
  };


  const sendMessage = () => {
    if (!input.trim()) return;
    if (wsRef.current && wsConnected) {
      try {
        wsRef.current.send(
          JSON.stringify({ type: "message", from: user, to, text: input })
        );
        setInput("");
      } catch (error) {
        console.error("WebSocket send error:", error);
        const fallbackMessage: Message = {
          id: Date.now(),
          text: `[Local] ${input}`,
          from: user,
          to: to,
          time: Date.now(),
        };
        setMessages((prev) => [...prev, fallbackMessage]);
        setInput("");
      }
    } else if (chatSystem.current) {
      try {
        const success = chatSystem.current.sendMessage(to, input);
        if (success) {
          setInput("");
        } else {
          console.log("Message requires permission or failed to send");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        const fallbackMessage: Message = {
          id: Date.now(),
          text: `[Local] ${input}`,
          from: user,
          to: to,
          time: Date.now(),
        };
        setMessages((prev) => [...prev, fallbackMessage]);
        setInput("");
      }
    } else {
      const fallbackMessage: Message = {
        id: Date.now(),
        text: `[Local] ${input}`,
        from: user,
        to: to,
        time: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
      setInput("");
    }
  };



  // Gemini audio reply logic
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const geminiAudioReply = async () => {
    if (!input.trim()) return;
    setIsGeminiLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const model = "models/gemini-2.5-flash-preview-native-audio-dialog";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const body = {
        contents: [{ role: "user", parts: [{ text: input }] }],
        generationConfig: {
          responseMimeType: "audio/wav",
          responseModality: "AUDIO",
        },
      };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to fetch Gemini audio");
      const data = await res.json();
      const audioBase64 = data?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
      if (audioBase64) {
        const audioBlob = new Blob([Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0))], { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      } else {
        alert("No audio reply received.");
      }
    } catch (err) {
      alert("Error with Gemini audio reply.");
      console.error(err);
    }
    setIsGeminiLoading(false);
  };



  const handlePermissionResponse = (granted: boolean) => {
    if (currentRequest && chatSystem.current) {
      chatSystem.current.handlePermissionResponse(currentRequest.from, granted, currentRequest.id);
      if (granted) {
        setAllowedContacts((prev) => [...prev, currentRequest.from]);
      }
    }
    setShowPermissionDialog(false);
    setCurrentRequest(null);
  };


  // Registration logic
  const registerUser = () => {
    const errors: string[] = [];
    if (!userInfo.name.trim()) errors.push("Name is required");
    if (!userInfo.email.trim()) errors.push("Email is required");
    if (!userInfo.phone.trim()) errors.push("Phone number is required");
    if (!userInfo.company.trim()) errors.push("Company/Organization is required");
    setRegistrationErrors(errors);
    if (errors.length > 0) return;
    // Assign color and set user
    const colors = [
      "bg-blue-600",
      "bg-green-600",
      "bg-red-600",
      "bg-yellow-600",
      "bg-pink-600",
      "bg-purple-600",
      "bg-teal-600",
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    setUser(userInfo.name);
    setUserColor(color);
    setShowUserRegistration(false);
    // Add to phonebook
    setPhonebook((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        company: userInfo.company,
        joinedAt: new Date().toISOString(),
        color,
      },
    ]);
  };

  // Registration page (priority)
  if (showUserRegistration) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black p-4">
        <div className="bg-black rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-800">
          <h2 className="text-xl font-semibold text-center mb-2 text-white">Join the Chat</h2>
          <p className="text-sm text-gray-400 text-center mb-6">
            Please provide your information to start chatting. You'll be assigned a unique color.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block text-white">Full Name *</label>
              <Input
                placeholder="John Doe"
                value={userInfo.name}
                onChange={e => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                className={`bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600 ${registrationErrors.some(e => e.includes('Name')) ? 'border-red-500' : ''}`}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-white">Email Address *</label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={userInfo.email}
                onChange={e => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                className={`bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600 ${registrationErrors.some(e => e.includes('email')) ? 'border-red-500' : ''}`}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-white">Phone Number *</label>
              <Input
                placeholder="+1 (555) 123-4567"
                value={userInfo.phone}
                onChange={e => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                className={`bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600 ${registrationErrors.some(e => e.includes('phone')) ? 'border-red-500' : ''}`}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-white">Company/Organization *</label>
              <Input
                placeholder="Acme Corp"
                value={userInfo.company}
                onChange={e => setUserInfo(prev => ({ ...prev, company: e.target.value }))}
                className={`bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600 ${registrationErrors.some(e => e.includes('Company')) ? 'border-red-500' : ''}`}
              />
            </div>
            {registrationErrors.length > 0 && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                <ul className="text-sm text-red-400 space-y-1">
                  {registrationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
            <Button
              onClick={registerUser}
              className="w-full bg-white text-black hover:bg-gray-200"
              disabled={!userInfo.name || !userInfo.email || !userInfo.phone || !userInfo.company}
            >
              Start Chatting
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Initial chat list page (dark theme) if not registered
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-full max-w-md mx-auto rounded-2xl shadow-xl bg-[#18181b]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <h2 className="text-2xl font-bold text-white">Messages</h2>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:bg-gray-800">
              <MoreVertical size={22} />
            </Button>
          </div>
          {/* Search Bar */}  
          <div className="px-6 pb-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search chats"
                className="w-full rounded-xl bg-[#232326] border-none text-white placeholder:text-gray-500 py-2 pl-10"
                // Add search logic if needed
              />
              <span className="absolute left-3 top-2.5 text-gray-500">
                <Search size={18} />
              </span>
            </div>
          </div>
          {/* Chat List */}
          <div className="px-2 pb-2">
            {(users.length === 0 ? [
              { name: "Robert Fox", last: "Thnx!", time: "4:28 PM", unread: 4, avatar: "/avatar1.png" },
              { name: "Marvin McKinney", last: "Wheewhoo", time: "1:46 PM", unread: 2, avatar: "/avatar2.png" },
              { name: "Ralph Edwards", last: "Defenetely", time: "1d", unread: 0, avatar: "/avatar3.png" },
              { name: "Albert Flores", last: "Thanks. I will reach you", time: "1w", unread: 0, avatar: "/avatar4.png" },
              { name: "Guy Hawkins", last: "Okay", time: "1m", unread: 0, avatar: "/avatar5.png" },
            ] : users.map(u => {
              const lastMsg = messages.filter(m => m.from === u || m.to === u).slice(-1)[0];
              return {
                name: u,
                last: lastMsg?.text || "No messages yet",
                time: lastMsg?.time ? new Date(lastMsg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
                unread: 0,
                avatar: "",
              };
            })).map((chat, idx) => (
              <div key={chat.name + idx} className="flex items-center px-4 py-3 border-b border-[#232326] cursor-pointer hover:bg-[#232326] transition">
                <Avatar className="w-12 h-12">
                  {chat.avatar ? (
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                  ) : (
                    <AvatarFallback className="bg-gray-700 text-white font-semibold">
                      {chat.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-white truncate">{chat.name}</span>
                    <span className="text-xs text-gray-400">{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 truncate">{chat.last}</span>
                    {chat.unread > 0 && (
                      <span className="ml-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{chat.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Floating menu button */}
          <div className="fixed bottom-8 right-8 z-50">
            <div className="relative group">
              <Button className="rounded-full w-14 h-14 bg-white text-black shadow-lg hover:bg-gray-200">
                <MoreVertical size={28} />
              </Button>
              <div className="absolute bottom-16 right-0 bg-[#232326] rounded-xl shadow-lg py-2 px-4 text-white text-sm space-y-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
                <div className="cursor-pointer hover:text-blue-400">Chat</div>
                <div className="cursor-pointer hover:text-blue-400">Contact</div>
                <div className="cursor-pointer hover:text-blue-400">Group</div>
                <div className="cursor-pointer hover:text-blue-400">Broadcast</div>
                <div className="cursor-pointer hover:text-blue-400">Team</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main chat UI (only one page, no duplicate)
  return (
    <div className="flex h-screen bg-black chat-page">
      {/* Desktop: Side-by-side layout, Mobile: Stacked layout */}
      {/* Left Sidebar - Desktop only */}
      <div className="hidden lg:flex lg:flex-col lg:w-80 xl:w-96 bg-black border-r border-gray-800">
        {/* Mobile View - List or Chat */}
        <div className="lg:hidden flex-1 flex flex-col overflow-y-auto">
          {to === 'all' ? (
            <>  {/* User List */}
              <div className="bg-black border-b border-gray-800 p-4">
                <h2 className="text-2xl font-bold text-white">Chats</h2>
              </div>
              <div className="px-4 py-2">
                {/* General */}
                <div
                  className={`flex items-center p-3 rounded-xl mb-2 cursor-pointer hover:bg-gray-800 text-white`}
                  onClick={() => setTo('all')}
                >
                  <Hash size={20} className="text-white" />
                  <span className="ml-3 text-sm font-semibold">General</span>
                </div>
                {/* Users */}
                {users.filter(u => u !== user).map(u => (
                  <div
                    key={u}
                    className="flex items-center p-3 rounded-xl mb-2 cursor-pointer hover:bg-gray-800 text-white"
                    onClick={() => setTo(u)}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className={`${onlineUsers.find(o=>o.name===u)?.color || 'bg-gray-500'} text-white font-semibold`}>
                        {u.slice(0,2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="ml-3 text-sm font-semibold">{u}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>  {/* Chat View */}
              <div className="bg-black border-b border-gray-800 flex items-center p-4">
                <Button variant="ghost" className="text-white mr-4" onClick={() => setTo('all')}>
                  <ArrowLeft size={20} />
                </Button>
                <h2 className="text-lg font-semibold text-white">{to}</h2>
              </div>
              <div className="flex-1 p-4 space-y-4 overflow-y-auto chat-messages">
                {messages.filter(m=> (m.to==='all'? m.to==='all': (m.from===user&&m.to===to)||(m.from===to&&m.to===user))).map(msg=> (
                  <div key={msg.id} className="flex items-start space-x-2">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className={`${msg.from===user?userColor:onlineUsers.find(o=>o.name===msg.from)?.color||'bg-gray-500'} text-white font-semibold`}>
                        {(msg.from===user?'You':msg.from).slice(0,2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <p className="text-sm text-white">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {/* Desktop Chat Header (only visible on desktop) */}
        <div className="hidden lg:flex bg-black border-b border-gray-800 px-6 py-4">
          <div className="flex items-center space-x-3">
            {to === 'all' ? (
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <Hash size={20} className="text-white" />
              </div>
            ) : (
              <Avatar className="w-10 h-10">
                {to === "Admin" ? (
                  <AvatarImage src="/kamogelo-photo.jpg" alt="Admin" />
                ) : (
                  <AvatarFallback className={`${onlineUsers.find(u => u.name === to)?.color || 'bg-gray-500'} text-white font-semibold`}>
                    {to.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            )}
            <div>
              <h2 className="text-lg font-semibold text-white">
                {to === 'all' ? 'General' : to}
              </h2>
              <p className="text-sm text-gray-400">
                {to === 'all' ? `${users.length + 1} members` : 'Active now'}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Main Chat Area - Full width on mobile, alongside sidebar on desktop */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Mobile Header (only visible on mobile) */}
        <div className="lg:hidden bg-black border-b border-gray-800">
          {/* Mobile Top Bar */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className={`${userColor} text-white font-semibold`}>
                  {user.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold text-white">{user}</h1>
                <p className="text-sm text-gray-400">● Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button size="sm" variant="ghost" className="text-white hover:bg-gray-800">
                <Search size={18} />
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-gray-800">
                <MoreVertical size={18} />
              </Button>
            </div>
          </div>

          {/* Mobile Chat Title */}
          <div className="px-4 pb-4">
            <h2 className="text-2xl font-bold mb-4 text-white">Chats</h2>
          </div>

          {/* Mobile Chat List */}
          <div className="px-4 pb-4">
            {/* General Channel */}
            <div 
              className={`flex items-center p-3 rounded-xl cursor-pointer mb-3 ${
                to === 'all' 
                  ? 'bg-white text-black' 
                  : 'hover:bg-gray-800 text-white'
              }`}
              onClick={() => setTo('all')}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                  <Hash size={20} className="text-white" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">General</p>
                  <span className="text-xs opacity-60">
                    {messages.filter(m => m.to === 'all' || !m.to).length > 0 && 
                      new Date(Math.max(...messages.filter(m => m.to === 'all' || !m.to).map(m => m.time || 0))).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  </span>
                </div>
                <p className="text-xs opacity-60">
                  {messages.filter(m => m.to === 'all' || !m.to).length > 0 
                    ? messages.filter(m => m.to === 'all' || !m.to).slice(-1)[0].text
                    : 'No messages yet'
                  }
                </p>
              </div>
            </div>

            {/* Individual Users */}
            {users.filter(u => u !== user).map(u => {
              const onlineUser = onlineUsers.find(ou => ou.name === u);
              const userMessages = messages.filter(m => 
                (m.from === user && m.to === u) || (m.from === u && m.to === user)
              );
              const lastMessage = userMessages.slice(-1)[0];
              
              return (
                <div 
                  key={u}
                  className={`flex items-center p-3 rounded-xl cursor-pointer mb-3 ${
                    to === u 
                      ? 'bg-white text-black' 
                      : 'hover:bg-gray-800 text-white'
                  }`}
                  onClick={() => setTo(u)}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      {u === "Admin" ? (
                        <AvatarImage src="/kamogelo-photo.jpg" alt="Admin" />
                      ) : (
                        <AvatarFallback className={`${onlineUser?.color || 'bg-gray-500'} text-white font-semibold`}>
                          {u.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{u}</p>
                      {!allowedContacts.includes(u) && u !== 'Admin' && (
                        <Badge variant="outline" className="text-xs border-gray-400">
                          Request
                        </Badge>
                      )}
                      <span className="text-xs opacity-60">
                        {lastMessage && new Date(lastMessage.time || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs opacity-60">
                      {lastMessage ? lastMessage.text : 'Start a conversation'}
                    </p>
                  </div>
                </div>
              )
            })}

            {/* Online Users Section */}
            <div className="mt-4 mb-3">
              <span className="text-xs font-medium text-gray-400">Online Users ({users.length})</span>
            </div>
          </div>
        </div>

        {/* Desktop Chat Header (only visible on desktop) */}
        <div className="hidden lg:flex bg-black border-b border-gray-800 px-6 py-4">
          <div className="flex items-center space-x-3">
            {to === 'all' ? (
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <Hash size={20} className="text-white" />
              </div>
            ) : (
              <Avatar className="w-10 h-10">
                {to === "Admin" ? (
                  <AvatarImage src="/kamogelo-photo.jpg" alt="Admin" />
                ) : (
                  <AvatarFallback className={`${onlineUsers.find(u => u.name === to)?.color || 'bg-gray-500'} text-white font-semibold`}>
                    {to.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            )}
            <div>
              <h2 className="text-lg font-semibold text-white">
                {to === 'all' ? 'General' : to}
              </h2>
              <p className="text-sm text-gray-400">
                {to === 'all' ? `${users.length + 1} members` : 'Active now'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:flex lg:flex-col lg:flex-1 lg:min-h-0 bg-black">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 chat-messages" style={{ overscrollBehavior: 'contain' }}>
            {messages
              .filter(msg =>
                to === 'all'
                  ? msg.to === 'all' || !msg.to
                  : (msg.from === user && msg.to === to) || (msg.from === to && msg.to === user)
              )
              .map(msg => {
                const senderUser = onlineUsers.find(u => u.name === msg.from);
                return (
                  <div key={msg.id} className="flex items-start space-x-4 message-enter">
                    {/* Avatar */}
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      {msg.from === "Admin" ? (
                        <AvatarImage src="/kamogelo-photo.jpg" alt="Admin" />
                      ) : (
                        <AvatarFallback className={`${msg.from === user ? userColor : senderUser?.color || 'bg-gray-500'} text-white font-semibold`}>
                          {(msg.from === user ? 'You' : msg.from).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-semibold text-white">
                          {msg.from === user ? 'You' : msg.from}
                        </span>
                        {msg.from === "Admin" && (
                          <Badge variant="secondary" className="text-xs bg-gray-800 text-white border-gray-700">
                            Admin
                          </Badge>
                        )}
                        <span className="text-xs text-gray-400">
                          {msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      
                      <div className="bg-gray-800 rounded-2xl px-4 py-3 border border-gray-700 max-w-2xl">
                        <p className="text-sm text-white leading-relaxed break-words">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input - Desktop & Mobile */}
          <div className="border-t border-gray-800 bg-black p-4 lg:p-6 fixed lg:static bottom-0 left-0 right-0 z-40">
            <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex items-end space-x-2 lg:space-x-4">
              {/* Gemini Audio Button on the left */}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-10 w-10 p-0 rounded-full hover:bg-gray-600 mr-2 flex-shrink-0"
                onClick={geminiAudioReply}
                disabled={isGeminiLoading || !input.trim()}
                aria-label="Gemini Audio Reply"
              >
                {isGeminiLoading ? (
                  <span className="animate-spin">🔊</span>
                ) : (
                  <span>🔊</span>
                )}
              </Button>
              {isAdmin && (
                <Avatar className="w-10 h-10 flex-shrink-0 hidden lg:block">
                  <AvatarImage src="/kamogelo-photo.jpg" alt="Admin" />
                </Avatar>
              )}
              <div className="flex-1 relative">
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-2 lg:p-4 flex items-center">
                  <Input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={`Message ${to === 'all' ? 'General' : to}...`}
                    className="border-0 bg-transparent p-0 text-base placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-white"
                    style={{ fontSize: 16 }}
                  />
                  <Button 
                    type="submit" 
                    disabled={!input.trim()} 
                    size="sm" 
                    className="ml-2 h-9 px-4 rounded-full bg-white hover:bg-gray-200 disabled:opacity-50 text-black font-medium"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>

      </div>
      
      {/* Floating Voice Assistant */}
      {user && !showUserRegistration && (
        <FloatingVoiceAssistant onTranscript={handleVoiceTranscript} />
      )}
      
      {/* Permission Request Dialog */}
      {showPermissionDialog && currentRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-black rounded-lg shadow-xl w-full max-w-md border border-gray-800">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Message Request
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                <span className="font-medium text-white">{currentRequest.from}</span> wants to send you a message:
              </p>
              <div className="bg-gray-800 rounded-lg p-3 mb-6 border border-gray-700">
                <p className="text-sm text-white break-words">
                  "{currentRequest.message}"
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => handlePermissionResponse(false)}
                  variant="outline"
                  className="flex-1 border-gray-600 text-white hover:bg-gray-800"
                >
                  Decline
                </Button>
                <Button
                  onClick={() => handlePermissionResponse(true)}
                  className="flex-1 bg-white text-black hover:bg-gray-200"
                >
                  Accept
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
            