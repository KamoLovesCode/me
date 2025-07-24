"use client";

import React, { useState, useRef } from "react";

// Add a simple shield SVG icon
function AdminIcon({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="fixed bottom-6 right-6 sm:bottom-6 sm:right-6 bottom-4 right-4 z-30 p-3 rounded-full bg-muted hover:bg-primary/20 transition shadow-lg"
      title="Admin login"
      onClick={onClick}
      type="button"
    >
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" className="text-primary"><path d="M12 3l7 4v5c0 5.25-3.5 9.74-7 11-3.5-1.26-7-5.75-7-11V7l7-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
    </button>
  );
}

export default function ChatPage() {
  const [userName, setUserName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [messages, setMessages] = useState<{ sender: string; content: string; timestamp: string }[]>([]);
  const [userInput, setUserInput] = useState("");
  const userInputRef = useRef<HTMLInputElement>(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminReply, setAdminReply] = useState("");
  const [selectedUserMsg, setSelectedUserMsg] = useState<number|null>(null);
  const ADMIN_CODE = "1234";

  const ownerName = "Kamogelo";

  const sendMessage = (sender: string, content: string) => {
    if (!content.trim()) return;
    setMessages(prev => [
      ...prev,
      { sender, content, timestamp: new Date().toLocaleTimeString() }
    ]);
    if (sender === userName) setUserInput("");
    setTimeout(() => {
      userInputRef.current?.focus();
    }, 0);
  };

  // If user hasn't entered their name, show name input
  if (!userName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="w-full max-w-xs flex flex-col items-center px-6 py-8 sm:px-8 sm:py-10">
          <h2 className="text-xl font-semibold mb-4 text-center">Enter your name</h2>
          <div className="flex w-full">
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="Your name"
              className="flex-1 px-4 py-3 rounded-l bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base sm:text-sm"
              onKeyDown={e => { if (e.key === "Enter" && nameInput.trim()) setUserName(nameInput.trim()); }}
            />
            <button
              onClick={() => nameInput.trim() && setUserName(nameInput.trim())}
              className="px-4 py-3 rounded-r bg-primary text-primary-foreground font-semibold hover:bg-primary/80 transition disabled:opacity-50 text-base sm:text-sm"
              disabled={!nameInput.trim()}
            >
              Start
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin modal overlay
  function AdminModal() {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30">
        <div className="bg-background rounded-xl shadow-xl p-6 w-full max-w-xs flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4">Admin Login</h3>
          <input
            type="password"
            value={adminCode}
            onChange={e => setAdminCode(e.target.value)}
            placeholder="Enter admin code"
            className="w-full px-4 py-2 rounded bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
            onKeyDown={e => {
              if (e.key === "Enter" && adminCode === ADMIN_CODE) {
                setIsAdmin(true); setAdminModalOpen(false); setAdminCode("");
              }
            }}
          />
          <div className="flex gap-2 w-full">
            <button
              className="flex-1 px-4 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/80 transition"
              onClick={() => {
                if (adminCode === ADMIN_CODE) {
                  setIsAdmin(true); setAdminModalOpen(false); setAdminCode("");
                }
              }}
            >Login</button>
            <button
              className="flex-1 px-4 py-2 rounded bg-muted text-foreground border border-border hover:bg-muted/80 transition"
              onClick={() => { setAdminModalOpen(false); setAdminCode(""); }}
            >Cancel</button>
          </div>
          {adminCode && adminCode !== ADMIN_CODE && (
            <div className="text-destructive text-sm mt-2">Incorrect code</div>
          )}
        </div>
      </div>
    );
  }

  // Admin panel overlay
  function AdminPanel() {
    // Only show user messages (not from Kamogelo)
    const userMsgs = messages.filter(m => m.sender !== ownerName);
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30">
        <div className="bg-background rounded-xl shadow-xl p-6 w-full max-w-md flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Admin Panel</h3>
            <button className="text-sm text-muted-foreground hover:text-primary" onClick={() => setIsAdmin(false)}>Close</button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-64 mb-4">
            {userMsgs.length === 0 ? (
              <div className="text-muted-foreground text-center">No user messages yet.</div>
            ) : (
              <ul className="space-y-2">
                {userMsgs.map((msg, idx) => (
                  <li key={idx}>
                    <button
                      className={`w-full text-left px-4 py-2 rounded bg-muted hover:bg-primary/10 transition ${selectedUserMsg === idx ? "ring-2 ring-primary" : ""}`}
                      onClick={() => setSelectedUserMsg(idx)}
                    >
                      <div className="font-semibold">{msg.sender} <span className="text-xs text-muted-foreground">{msg.timestamp}</span></div>
                      <div className="text-sm break-words">{msg.content}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedUserMsg !== null && userMsgs[selectedUserMsg] && (
            <form
              className="flex gap-2 mt-2"
              onSubmit={e => {
                e.preventDefault();
                // Send reply as Kamogelo to the selected user
                setMessages(prev => [
                  ...prev,
                  { sender: ownerName, content: adminReply, timestamp: new Date().toLocaleTimeString() }
                ]);
                setAdminReply("");
                setSelectedUserMsg(null);
              }}
            >
              <input
                type="text"
                value={adminReply}
                onChange={e => setAdminReply(e.target.value)}
                placeholder={`Reply to ${userMsgs[selectedUserMsg].sender}`}
                className="flex-1 px-4 py-2 rounded bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/80 transition disabled:opacity-50"
                disabled={!adminReply.trim()}
              >Send</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground relative">
      {/* Admin icon button at bottom right */}
      <AdminIcon onClick={() => setAdminModalOpen(true)} />
      {adminModalOpen && <AdminModal />}
      {isAdmin && <AdminPanel />}
      <main className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-2xl flex flex-col flex-1 h-[80vh] mx-auto px-2 sm:px-8 py-4 sm:py-8">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-1 sm:px-2 py-2 sm:py-4 space-y-4 chat-messages">
            {messages.length === 0 ? (
              <div className="text-muted-foreground text-center mt-20">No messages yet...</div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === userName ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80vw] sm:max-w-[70%] px-5 py-3 sm:px-6 sm:py-4 rounded-lg message-bubble
                    ${msg.sender === userName
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1 opacity-60">
                      {msg.sender}
                      <span className="ml-2 text-[10px]">{msg.timestamp}</span>
                    </div>
                    <div className="break-words">{msg.content}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Input */}
          <form
            className="flex items-center gap-2 p-3 sm:p-4 w-full mobile-input-safe"
            onSubmit={e => {
              e.preventDefault();
              sendMessage(userName, userInput);
            }}
          >
            <input
              ref={userInputRef}
              type="text"
              placeholder="Type a message..."
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              className="flex-1 px-4 py-3 sm:px-5 sm:py-3 rounded bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base sm:text-sm mobile-input"
            />
            <button
              type="submit"
              className="px-4 py-3 sm:px-5 sm:py-3 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/80 transition disabled:opacity-50 text-base sm:text-sm"
              disabled={!userInput.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
            