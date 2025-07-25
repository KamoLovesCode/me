"use client";

import React, { useState, useRef, useEffect } from "react";

function AdminIcon({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="fixed bottom-6 right-6 sm:bottom-6 sm:right-6 z-30 p-3 rounded-full bg-muted hover:bg-primary/20 transition shadow-lg"
      title="Admin login"
      onClick={onClick}
      type="button"
    >
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" className="text-primary">
        <path d="M12 3l7 4v5c0 5.25-3.5 9.74-7 11-3.5-1.26-7-5.75-7-11V7l7-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default function ChatPage() {
  const [userName, setUserName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [messages, setMessages] = useState<{ sender: string; content: string; timestamp: string }[]>([]);
  const [userInput, setUserInput] = useState("");
  const userInputRef = useRef<HTMLInputElement>(null);

  // Admin states
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const ADMIN_CODE = "1234";

  const [adminTarget, setAdminTarget] = useState<string | null>(null);
  const ownerName = "Kamogelo";

  // Load from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("chatUserName");
    if (savedName) setUserName(savedName);
    const savedMsgs = localStorage.getItem("chatMessages");
    if (savedMsgs) setMessages(JSON.parse(savedMsgs));
    // Check URL param for admin view
    const params = new URLSearchParams(window.location.search);
    const target = params.get("adminUser");
    if (target) setAdminTarget(target);
  }, []);

  // Persist userName & messages
  useEffect(() => { if (userName) localStorage.setItem("chatUserName", userName); }, [userName]);
  useEffect(() => { localStorage.setItem("chatMessages", JSON.stringify(messages)); }, [messages]);

  const sendMessage = (sender: string, content: string) => {
    if (!content.trim()) return;
    const newMsg = { sender, content, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, newMsg]);
    if (sender === userName) setUserInput("");
    setTimeout(() => userInputRef.current?.focus(), 0);
  };

  // If user hasn't entered name and not adminTarget mode: ask for name
  if (!userName && !adminTarget) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="w-full max-w-xs flex flex-col items-center px-6 py-8">
          <h2 className="text-xl font-semibold mb-4">Enter your name</h2>
          <div className="flex w-full">
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="Your name"
              className="flex-1 px-4 py-3 rounded-l bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyDown={e => { if (e.key === "Enter" && nameInput.trim()) setUserName(nameInput.trim()); }}
            />
            <button
              onClick={() => nameInput.trim() && setUserName(nameInput.trim())}
              className="px-4 py-3 rounded-r bg-primary hover:bg-primary/80 disabled:opacity-50"
              disabled={!nameInput.trim()}
            >Start</button>
          </div>
        </div>
      </div>
    );
  }

  // Admin login modal
  const AdminModal = () => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30">
      <div className="bg-background rounded-xl shadow-xl p-6 w-full max-w-xs">
        <h3 className="text-lg font-semibold mb-4">Admin Login</h3>
        <input
          type="password"
          value={adminCode}
          onChange={e => setAdminCode(e.target.value)}
          placeholder="Enter admin code"
          className="w-full px-4 py-2 rounded bg-muted focus:outline-none focus:ring-2 focus:ring-primary mb-4"
          onKeyDown={e => { if (e.key === "Enter" && adminCode === ADMIN_CODE) { setIsAdmin(true); setAdminModalOpen(false); } }}
        />
        <div className="flex gap-2">
          <button
            className="flex-1 px-4 py-2 rounded bg-primary hover:bg-primary/80"
            onClick={() => { if (adminCode === ADMIN_CODE) { setIsAdmin(true); setAdminModalOpen(false); } }}
          >Login</button>
          <button className="flex-1 px-4 py-2 rounded bg-muted" onClick={() => setAdminModalOpen(false)}>Cancel</button>
        </div>
      </div>
    </div>
  );

  // Admin user list panel
  const AdminPanel = () => {
    const users = Array.from(new Set(messages.filter(m => m.sender !== ownerName).map(m => m.sender)));
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30">
        <div className="bg-background rounded-xl shadow-xl p-6 w-full max-w-sm">
          <h3 className="text-lg font-semibold mb-4">Users</h3>
          {users.length === 0
            ? <div className="text-muted-foreground">No users.</div>
            : users.map((u, i) => (
                <button
                  key={i}
                  className="block w-full text-left px-4 py-2 rounded hover:bg-primary/10 mb-2"
                  onClick={() => window.open(`${window.location.origin}${window.location.pathname}?adminUser=${encodeURIComponent(u)}`, '_blank')}
                >{u}</button>
              ))
          }
          <button className="mt-4 text-sm text-muted-foreground hover:text-primary" onClick={() => setIsAdmin(false)}>Close</button>
        </div>
      </div>
    );
  };

  // Admin chat view for specific user
  if (isAdmin && adminTarget) {
    const convo = messages.filter(m => m.sender === adminTarget || m.sender === ownerName);
    const [reply, setReply] = useState("");
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground p-4">
        <h2 className="text-xl font-semibold mb-4">Chat with {adminTarget}</h2>
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {convo.map((msg, idx) => (
            <div key={idx} className={msg.sender === ownerName ? 'text-right' : 'text-left'}>
              <div className="inline-block px-4 py-2 rounded-lg
                "
                style={{background: msg.sender === ownerName ? '#3b82f6' : '#e5e7eb', color: msg.sender === ownerName ? '#fff' : '#000'}}
              >
                <div className="text-xs opacity-60 mb-1">{msg.sender}</div>
                <div>{msg.content}</div>
                <div className="text-[10px] opacity-50 mt-1">{msg.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
        <form className="flex gap-2" onSubmit={e => { e.preventDefault(); sendMessage(ownerName, reply); setReply(""); }}>
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Type a reply..."
            value={reply}
            onChange={e => setReply(e.target.value)}
          />
          <button type="submit" className="px-4 py-2 rounded bg-primary hover:bg-primary/80" disabled={!reply.trim()}>Send</button>
        </form>
      </div>
    );
  }

  // Main app view
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      <AdminIcon onClick={() => setAdminModalOpen(true)} />
      {adminModalOpen && <AdminModal />}
      {isAdmin && <AdminPanel />}

      <main className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-2xl flex flex-col flex-1 h-[80vh] mx-auto px-2 py-4">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.length === 0
              ? <div className="text-muted-foreground text-center mt-20">No messages yet...</div>
              : messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === userName ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-5 py-3 rounded-lg
                      ${msg.sender === userName ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}
                    >
                      <div className="text-xs opacity-60 mb-1">{msg.sender}</div>
                      <div>{msg.content}</div>
                      <div className="text-[10px] opacity-50 mt-1">{msg.timestamp}</div>
                    </div>
                  </div>
                ))
            }
          </div>
          <form className="flex gap-2" onSubmit={e => { e.preventDefault(); sendMessage(userName, userInput); }}>
            <input
              ref={userInputRef}
              type="text"
              placeholder="Type a message..."
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              className="flex-1 px-4 py-2 rounded bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button type="submit" className="px-4 py-2 rounded bg-primary hover:bg-primary/80" disabled={!userInput.trim()}>Send</button>
          </form>
        </div>
      </main>
    </div>
  );
}
