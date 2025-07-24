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
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [users, setUsers] = useState<string[]>([])
  const [user, setUser] = useState<string>("")
  const [to, setTo] = useState<string>('all')
  const [showPrompt, setShowPrompt] = useState(true)
  const [nameInput, setNameInput] = useState("")
  const ws = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
      }
    }
    return () => {
      ws.current?.close()
    }
  }, [user])

  useEffect(() => {
    // Always scroll to bottom on new message, even if not focused
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
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
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b border-border flex items-center justify-between">
        <h1 className="text-xl font-semibold">Chat</h1>
        <Link href="/">
          <X size={24} className="text-muted-foreground hover:text-foreground cursor-pointer" />
        </Link>
      </header>
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
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
          <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-4 bg-background min-h-0 max-h-full">
            {messages
              .filter(msg =>
                to === 'all'
                  ? msg.to === 'all' || !msg.to
                  : (msg.from === user && msg.to === to) || (msg.from === to && msg.to === user)
              )
              .map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.from === user ? 'items-end' : 'items-start'} w-full`}
                >
                  <div
                    className={`w-full max-w-[90vw] md:max-w-md p-2 rounded-lg break-words overflow-x-auto
                      ${msg.from === user
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100 rounded-bl-none border border-green-300 dark:border-green-700'}`}
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                  >
                    <span className={`block text-xs font-semibold mb-1 opacity-80 ${msg.from === user ? 'text-primary-foreground' : 'text-green-700 dark:text-green-200'}`}>{msg.from}</span>
                    <span className="block text-base">{msg.text}</span>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>
          <form
            className="p-2 md:p-4 border-t border-border bg-background flex gap-2"
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
            />
            <Button type="submit">
              Send
            </Button>
          </form>
        </div>
        {/* Details panel - hidden on mobile */}
        <div className="hidden md:block w-64 border-l border-border p-4 overflow-y-auto bg-background">
          <h2 className="text-lg font-semibold mb-4">Details</h2>
          {/* TODO: show chat details */}
        </div>
      </div>
    </div>
  )
}
