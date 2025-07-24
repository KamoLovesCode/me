"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X } from 'lucide-react'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"


interface Message {
  id: number;
  text: string;
  from: string;
  to?: string;
  time?: number;
}

export default function ChatPage() {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [users, setUsers] = useState<string[]>([])
  const [user, setUser] = useState<string>("")
  const [to, setTo] = useState<string>('all')
  const [showPrompt, setShowPrompt] = useState(true)
  const [nameInput, setNameInput] = useState("")
  const ws = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Topic state for details pane
  const [topic, setTopic] = useState("");
  const [showTopicInput, setShowTopicInput] = useState(false);
  const [topicInput, setTopicInput] = useState("");

  // Load chat history for this user from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chat-username') || ''
    if (saved) {
      setUser(saved)
      setShowPrompt(false)
      const chatHistory = localStorage.getItem(`chat-history-${saved}`)
      if (chatHistory) {
        try {
          setMessages(JSON.parse(chatHistory))
        } catch {}
      }
    }
  }, [])

  // Connect to WebSocket server
  useEffect(() => {
    if (!user) return
    ws.current = new window.WebSocket('ws://localhost:3002')
    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({ type: 'join', user }))
    }
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'users') {
        setUsers(data.users)
      } else if (data.type === 'message') {
        setMessages(prev => {
          const updated = [...prev, {
            id: data.time || Date.now(),
            text: data.text,
            from: data.from,
            to: data.to,
            time: data.time,
          }];
          // Save chat history for this user
          localStorage.setItem(`chat-history-${user}`, JSON.stringify(updated))
          return updated
        })
// Utility to generate a persistent device ID (works on GitHub Pages, Vercel, etc.)
function getDeviceId() {
  let id = localStorage.getItem('deviceId');
  if (!id) {
    id = 'dev-' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('deviceId', id);
  }
  return id;
}
      }
    }
    return () => {
      ws.current?.close()
    }
  }, [user])

  useEffect(() => {
    // Always scroll to bottom on new message, even if not focused
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !ws.current) return
    ws.current.send(JSON.stringify({
      type: 'message',
      from: user,
      to,
      text: input,
    }))
    setInput("")
  }

  if (showPrompt) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 w-full max-w-xs flex flex-col gap-4 border border-border">
          <h2 className="text-lg font-semibold text-center">Enter your name to join the chat</h2>
          <Input
            autoFocus
            placeholder="Your name..."
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && nameInput.trim()) {
                localStorage.setItem('chat-username', nameInput.trim())
                setUser(nameInput.trim())
                setShowPrompt(false)
              }
            }}
          />
          <Button
            disabled={!nameInput.trim()}
            onClick={() => {
              if (nameInput.trim()) {
                localStorage.setItem('chat-username', nameInput.trim())
                setUser(nameInput.trim())
                setShowPrompt(false)
              }
            }}
          >
            Join Chat
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <header className="p-4 border-b border-border flex items-center justify-between">
        {/* Hide chat icon on mobile chat page (if present) */}
        <style>{`
          @media (max-width: 640px) {
            .chat-sheet-icon { display: none !important; }
          }
        `}</style>
        <h1 className="text-xl font-semibold">Chat</h1>
        <div className="flex gap-2 items-center">
          <button
            className="text-xs text-red-500 border border-red-500 rounded px-2 py-1 hover:bg-red-50 dark:hover:bg-zinc-900 transition"
            onClick={() => {
              setUser("");
              localStorage.removeItem('chat-username');
              window.location.href = "/";
            }}
          >
            Exit Chat
          </button>
          <Link href="/">
            <X size={24} className="text-muted-foreground hover:text-foreground cursor-pointer" />
          </Link>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row min-h-0">
        {/* Chat list panel */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border p-4 overflow-y-auto bg-background">
          <h2 className="text-lg font-semibold mb-4">Active Users</h2>
          <ul className="space-y-2 flex flex-row md:flex-col flex-wrap md:flex-nowrap">
            <li className="flex-1 md:flex-none">
              <button
                className={`w-full text-left px-2 py-1 rounded ${to === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                onClick={() => setTo('all')}
              >
                Everyone
              </button>
            </li>
            {users.filter(u => u !== user).map(u => (
              <li key={u} className="flex-1 md:flex-none">
                <button
                  className={`w-full text-left px-2 py-1 rounded ${to === u ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  onClick={() => setTo(u)}
                >
                  {u}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {/* Messages panel */}
         <div className="flex-1 flex flex-col min-w-0 min-h-0">
           <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-4 bg-background min-h-0 max-h-full" style={{ overscrollBehavior: 'contain' }}>
            {messages
              .filter(msg =>
                to === 'all'
                  ? msg.to === 'all' || !msg.to
                  : (msg.from === user && msg.to === to) || (msg.from === to && msg.to === user)
              )
              .map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col w-full ${msg.from === user ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`relative w-full max-w-[90vw] md:max-w-md p-2 rounded-lg break-words overflow-x-auto
                      ${msg.from === user
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-white text-gray-900 dark:bg-zinc-800 dark:text-gray-100 border border-gray-200 dark:border-zinc-700 rounded-bl-none'}`}
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                  >
                    <span className={`block text-xs font-semibold mb-1 opacity-80 ${msg.from === user ? 'text-primary-foreground' : 'text-primary'}`}>{msg.from === user ? 'You' : msg.from}</span>
                    <span className="block text-base">{msg.text}</span>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>
           <form
             className="p-2 md:p-4 border-t border-border bg-background flex gap-2 sticky bottom-0 z-10"
             style={{ background: 'inherit' }}
             onSubmit={e => { e.preventDefault(); sendMessage(); }}
           >
             <Input
               type="text"
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && sendMessage()}
               placeholder="Type a message..."
               className="flex-1 min-w-0"
               autoComplete="off"
               style={{ minHeight: 40, fontSize: 16 }}
             />
             <Button type="submit" style={{ minHeight: 40, fontSize: 16 }}>
               Send
             </Button>
           </form>
        </div>
        {/* Details panel - hidden on mobile */}
        <div className="hidden md:block w-64 border-l border-border p-4 overflow-y-auto bg-background">
          <h2 className="text-lg font-semibold mb-4">Details</h2>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">Current time:</span>
              <span className="text-xs font-mono">{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground">Chat Topic:</span>
              <span className="text-sm font-medium break-words min-h-[24px]">{topic || 'No topic set.'}</span>
              <button
                className="mt-1 px-2 py-1 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90 w-fit"
                onClick={() => setShowTopicInput(true)}
              >
                {topic ? 'Edit Topic' : 'Add Topic'}
              </button>
              {showTopicInput && (
                <form
                  className="flex gap-2 mt-2"
                  onSubmit={e => { e.preventDefault(); setShowTopicInput(false); }}
                >
                  <input
                    type="text"
                    value={topicInput}
                    onChange={e => setTopicInput(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring"
                    placeholder="Enter chat topic..."
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 text-xs rounded bg-green-500 text-white hover:bg-green-600"
                    onClick={() => { setTopic(topicInput); setShowTopicInput(false); }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 text-xs rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
                    onClick={() => setShowTopicInput(false)}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
