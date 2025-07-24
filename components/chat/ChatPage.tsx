"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, UserCog, Phone, Search, MoreVertical, Send, Paperclip, Smile, Settings, Users, Hash } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import FloatingVoiceAssistant from "@/components/FloatingVoiceAssistant"


interface Message {
  id: number;
  text: string;
  from: string;
  to?: string;
  time?: number;
}

export default function ChatPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [showPhonebook, setShowPhonebook] = useState(false)
  const [showUserRegistration, setShowUserRegistration] = useState(true)
  const [adminPassword, setAdminPassword] = useState("")
  
  // User registration fields
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    company: ""
  })
  const [registrationErrors, setRegistrationErrors] = useState<string[]>([])
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [users, setUsers] = useState<string[]>([])
  const [user, setUser] = useState<string>("")
  const [to, setTo] = useState<string>('all')
  const [nameInput, setNameInput] = useState("")
  const ws = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Topic state for details pane
  const [topic, setTopic] = useState("");
  const [showTopicInput, setShowTopicInput] = useState(false);
  const [topicInput, setTopicInput] = useState("");

  // Phonebook state
  const [phonebook, setPhonebook] = useState<Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    joinedAt: string;
  }>>([])

  // Load registered users from localStorage
  useEffect(() => {
    const registeredUsers = localStorage.getItem('chat-phonebook')
    if (registeredUsers) {
      try {
        setPhonebook(JSON.parse(registeredUsers))
      } catch {}
    }
  }, [])

  // Validation functions
  const validateName = (name: string): boolean => {
    // Must be 2-50 characters, only letters, spaces, hyphens, apostrophes
    const nameRegex = /^[a-zA-Z\s\-']{2,50}$/
    return nameRegex.test(name.trim())
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  const validatePhone = (phone: string): boolean => {
    // Allow various phone formats
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/
    return phoneRegex.test(phone.trim())
  }

  const validateUserRegistration = (): boolean => {
    const errors: string[] = []
    
    if (!validateName(userInfo.name)) {
      errors.push("Name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes")
    }
    
    if (!validateEmail(userInfo.email)) {
      errors.push("Please enter a valid email address")
    }
    
    if (!validatePhone(userInfo.phone)) {
      errors.push("Please enter a valid phone number")
    }
    
    if (userInfo.company.trim().length < 2) {
      errors.push("Company/Organization name is required")
    }
    
    // Check if email already exists
    if (phonebook.some(entry => entry.email.toLowerCase() === userInfo.email.toLowerCase())) {
      errors.push("This email is already registered")
    }
    
    setRegistrationErrors(errors)
    return errors.length === 0
  }

  const registerUser = () => {
    if (!validateUserRegistration()) return
    
    const newUser = {
      id: Date.now().toString(),
      name: userInfo.name.trim(),
      email: userInfo.email.trim().toLowerCase(),
      phone: userInfo.phone.trim(),
      company: userInfo.company.trim(),
      joinedAt: new Date().toISOString()
    }
    
    const updatedPhonebook = [...phonebook, newUser]
    setPhonebook(updatedPhonebook)
    localStorage.setItem('chat-phonebook', JSON.stringify(updatedPhonebook))
    localStorage.setItem('chat-username', newUser.name)
    
    setUser(newUser.name)
    setShowUserRegistration(false)
  }

  // Load chat history for this user from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chat-username') || ''
    if (saved) {
      setUser(saved)
      setShowUserRegistration(false)
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

  const handleVoiceTranscript = (transcript: string) => {
    // Add the voice transcript as a message from the user
    if (ws.current && user) {
      ws.current.send(JSON.stringify({
        type: 'message',
        from: user,
        to,
        text: `🎤 ${transcript}`,
      }))
    }
  }

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

  if (showUserRegistration) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 w-full max-w-md border border-border">
          <h2 className="text-xl font-semibold text-center mb-6">Join the Chat</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Please provide your information to start chatting with Kamogelo
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Full Name *</label>
              <Input
                placeholder="John Doe"
                value={userInfo.name}
                onChange={e => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                className={registrationErrors.some(e => e.includes('Name')) ? 'border-red-500' : ''}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Email Address *</label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={userInfo.email}
                onChange={e => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                className={registrationErrors.some(e => e.includes('email')) ? 'border-red-500' : ''}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Phone Number *</label>
              <Input
                placeholder="+1 (555) 123-4567"
                value={userInfo.phone}
                onChange={e => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                className={registrationErrors.some(e => e.includes('phone')) ? 'border-red-500' : ''}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Company/Organization *</label>
              <Input
                placeholder="Acme Corp"
                value={userInfo.company}
                onChange={e => setUserInfo(prev => ({ ...prev, company: e.target.value }))}
                className={registrationErrors.some(e => e.includes('Company')) ? 'border-red-500' : ''}
              />
            </div>
            
            {registrationErrors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                  {registrationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button
              onClick={registerUser}
              className="w-full"
              disabled={!userInfo.name || !userInfo.email || !userInfo.phone || !userInfo.company}
            >
              Start Chatting
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden safe-area-inset">
      <header className="p-4 border-b border-border flex items-center justify-between shrink-0">
        {/* Hide chat icon on mobile chat page (if present) */}
        <style>{`
          @media (max-width: 640px) {
            .chat-sheet-icon { display: none !important; }
          }
        `}</style>
        <h1 className="text-xl font-bold tracking-tight">Chat</h1>
        <div className="flex gap-2 items-center justify-end w-auto">
          {/* Admin phonebook button */}
          {isAdmin && (
            <button
              className="p-1 rounded-full bg-green-500 hover:bg-green-600 transition flex items-center justify-center"
              aria-label="View Phonebook"
              onClick={() => setShowPhonebook(true)}
              style={{ width: 32, height: 32 }}
            >
              <Phone size={16} className="text-white mx-auto" />
            </button>
          )}
          
          {/* Admin login button */}
          <button
            className="p-1 rounded-full bg-blue-500 hover:bg-blue-600 transition flex items-center justify-center"
            aria-label="Admin Login"
            onClick={() => setShowAdminLogin(true)}
            style={{ width: 32, height: 32 }}
          >
            <UserCog size={16} className="text-white mx-auto" />
          </button>
          
          {/* Exit button */}
          <button
            className="ml-2 p-1 rounded-full bg-red-500 hover:bg-red-600 transition flex items-center justify-center"
            aria-label="Exit Chat"
            onClick={() => {
              setUser("");
              setIsAdmin(false);
              localStorage.removeItem('chat-username');
              window.location.href = "/";
            }}
            style={{ width: 32, height: 32 }}
          >
            <X size={16} className="text-white mx-auto" />
          </button>
        </div>
      </header>
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 w-full max-w-xs flex flex-col gap-4 border border-border">
            <h2 className="text-lg font-bold text-center">Admin Login</h2>
            <Input
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  if (adminPassword === "2255") {
                    setIsAdmin(true);
                    setShowAdminLogin(false);
                    setUser("Admin");
                    setShowUserRegistration(false);
                  }
                }}
              >Login</Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowAdminLogin(false)}>Cancel</Button>
            </div>
            {adminPassword && adminPassword !== "2255" && (
              <span className="text-xs text-red-500 text-center">Incorrect password</span>
            )}
          </div>
        </div>
      )}
      
      {/* Phonebook Modal */}
      {showPhonebook && isAdmin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold">User Phonebook</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowPhonebook(false)}>
                <X size={16} />
              </Button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(80vh-120px)] p-4">
              {phonebook.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>No registered users yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {phonebook.map((entry) => (
                    <div key={entry.id} className="bg-muted/50 rounded-lg p-4 border border-border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">{entry.name}</h3>
                          <p className="text-sm text-muted-foreground">{entry.company}</p>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Email:</span>
                            <a href={`mailto:${entry.email}`} className="text-blue-600 hover:underline">
                              {entry.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Phone:</span>
                            <a href={`tel:${entry.phone}`} className="text-blue-600 hover:underline">
                              {entry.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Joined:</span>
                            <span className="text-muted-foreground">
                              {new Date(entry.joinedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="border-t border-border p-4">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Total registered users: {phonebook.length}</span>
                <Button variant="outline" onClick={() => setShowPhonebook(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden flex-col min-h-0">
        {/* Chat list panel - collapsed on mobile */}
        <div className="w-full border-b border-border p-2 sm:p-4 overflow-y-auto bg-background shrink-0">
          <h2 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4">Active Users</h2>
          <ul className="space-y-1 sm:space-y-2 flex flex-row flex-wrap gap-1 sm:gap-2">
            <li className="flex-none">
              <button
                className={`text-xs sm:text-sm px-2 py-1 rounded whitespace-nowrap ${to === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                onClick={() => setTo('all')}
              >
                Everyone
              </button>
            </li>
            {users.filter(u => u !== user).map(u => (
              <li key={u} className="flex-none">
                <button
                  className={`text-xs sm:text-sm px-2 py-1 rounded whitespace-nowrap ${to === u ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
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
           <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4 bg-background min-h-0 max-h-full pb-safe" style={{ overscrollBehavior: 'contain' }}>
            {messages
              .filter(msg =>
                to === 'all'
                  ? msg.to === 'all' || !msg.to
                  : (msg.from === user && msg.to === to) || (msg.from === to && msg.to === user)
              )
              .map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col w-full ${msg.from === user || msg.from === "Admin" ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`relative w-full max-w-[90vw] md:max-w-md p-2 rounded-lg break-words overflow-x-auto
                      ${msg.from === user || msg.from === "Admin"
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-white text-gray-900 dark:bg-zinc-800 dark:text-gray-100 border border-gray-200 dark:border-zinc-700 rounded-bl-none'}`}
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', fontFamily: 'Inter, sans-serif', fontWeight: msg.from === user || msg.from === "Admin" ? 500 : 400 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`block text-xs font-bold opacity-80 flex items-center gap-2 ${msg.from === user || msg.from === "Admin" ? 'text-primary-foreground' : 'text-primary'}`}>{msg.from === "Admin" ? <Image src="/kamogelo-photo.jpg" alt="Admin" width={22} height={22} className="rounded-full border border-primary" /> : null}{msg.from === user ? 'You' : msg.from}</span>
                      <span className="block text-[10px] text-muted-foreground ml-2">{msg.time ? new Date(msg.time).toLocaleTimeString() : ''}</span>
                    </div>
                    <span className="block text-base font-medium" style={{ fontWeight: 500 }}>{msg.text}</span>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>
           <form
             className="p-2 sm:p-4 border-t border-border bg-background flex gap-2 sticky bottom-0 z-10 pb-safe shrink-0"
             style={{ background: 'inherit' }}
             onSubmit={e => { e.preventDefault(); sendMessage(); }}
           >
             {isAdmin && (
               <Image src="/kamogelo-photo.jpg" alt="Admin" width={24} height={24} className="rounded-full border border-primary object-cover shrink-0" style={{ width: 24, height: 24 }} />
             )}
             <Input
               type="text"
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && sendMessage()}
               placeholder={isAdmin ? "Send a message to users..." : "Type a message..."}
               className="flex-1 min-w-0 font-medium text-base"
               autoComplete="off"
               style={{ minHeight: 44, fontSize: 16, fontWeight: 500 }}
             />
             <Button type="submit" className="shrink-0" style={{ minHeight: 44, fontSize: 16, fontWeight: 600 }}>
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
      
      {/* Floating Voice Assistant */}
      {user && !showUserRegistration && (
        <FloatingVoiceAssistant onTranscript={handleVoiceTranscript} />
      )}
    </div>
  )
}
