"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

let PeerChatSystem: any = null;
if (typeof window !== 'undefined') {
  // @ts-ignore
  PeerChatSystem = window.PeerChatSystem;
}

// Add a simple shield SVG icon
function AdminIcon() {
  return (
    <Link href="/admin">
      <button
        className="fixed bottom-6 right-6 sm:bottom-6 sm:right-6 bottom-4 right-4 z-30 p-3 rounded-full bg-muted hover:bg-primary/20 transition shadow-lg"
        title="Admin login"
        type="button"
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" className="text-primary"><path d="M12 3l7 4v5c0 5.25-3.5 9.74-7 11-3.5-1.26-7-5.75-7-11V7l7-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
      </button>
    </Link>
  );
}

export default function ChatPage() {
  const [userName, setUserName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [userInput, setUserInput] = useState("");
  const userInputRef = useRef<HTMLInputElement>(null);
  const [peerChat, setPeerChat] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ownerName = "Kamogelo";

  // Initialize PeerChatSystem on mount
  useEffect(() => {
    let instance: any;
    let mounted = true;
    async function loadPeerChat() {
      const mod = await import("../../lib/peer-chat.js");
      instance = new mod.default();
      setPeerChat(instance);
    }
    loadPeerChat();
    return () => { mounted = false; };
  }, []);

  // Join chat and set up listeners when userName is set and peerChat is ready
  useEffect(() => {
    if (!peerChat || !userName) return;
    // Join as user
    peerChat.join(userName, "bg-cyan-500");
    setMessages(peerChat.getMessages());
    // Listen for new messages
    peerChat.onNewMessage = (msg: any) => {
      setMessages([...peerChat.getMessages()]);
    };
    // Optionally listen for users update
    // peerChat.onUsersUpdate = (users: any) => { ... };
    peerChat.startHeartbeat();
    return () => peerChat.stopHeartbeat();
  }, [peerChat, userName]);

  // Always scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (sender: string, content: string) => {
    if (!content.trim() || !peerChat) return;
    peerChat.sendMessage("all", content);
    setUserInput("");
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

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground relative">
      {/* Admin icon button at bottom right */}
      <AdminIcon />
      <main className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-2xl flex flex-col flex-1 h-[80vh] mx-auto px-2 sm:px-8 py-4 sm:py-8">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-1 sm:px-2 py-2 sm:py-4 space-y-4 chat-messages">
            {messages.length === 0 ? (
              <div className="text-muted-foreground text-center mt-20">No messages yet...</div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`flex ${msg.from === userName ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80vw] sm:max-w-[70%] px-5 py-3 sm:px-6 sm:py-4 rounded-lg message-bubble
                    ${msg.from === userName
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1 opacity-60">
                      {msg.from}
                      <span className="ml-2 text-[10px]">{msg.time ? new Date(msg.time).toLocaleTimeString() : ""}</span>
                    </div>
                    <div className="break-words">{msg.text}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
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
            