"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, UserCog, Phone, Search, MoreVertical, Send, Paperclip, Smile, Settings, Users, Hash, ArrowLeft } from 'lucide-react'
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop: Side-by-side layout, Mobile: Stacked layout */}
      
      {/* Left Sidebar - Desktop only */}
      <div className="hidden lg:flex lg:flex-col lg:w-80 xl:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white font-semibold">
                {user.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-semibold">{user}</h1>
              <p className="text-sm text-green-600 dark:text-green-400">● Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {isAdmin && (
              <Button size="sm" variant="ghost" onClick={() => setShowPhonebook(true)}>
                <Phone size={16} />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setShowAdminLogin(true)}>
              <UserCog size={16} />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => {
              setUser("");
              setIsAdmin(false);
              localStorage.removeItem('chat-username');
              window.location.href = "/";
            }}>
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Chat Categories */}
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Chat</h2>
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button className="flex-1 py-2 px-3 text-sm font-medium bg-white dark:bg-gray-600 text-gray-900 dark:text-white rounded-md shadow-sm">
              All
            </button>
            <button className="flex-1 py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              Work
            </button>
            <button className="flex-1 py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              Personal
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search conversations" className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600" />
          </div>
        </div>

        {/* Pinned Section */}
        <div className="px-4 pb-2">
          <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
            <span>📌 Pinned</span>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* General Channel - Pinned */}
          <div 
            className={`flex items-center p-3 rounded-xl cursor-pointer mb-2 transition-all duration-200 ${
              to === 'all' 
                ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => setTo('all')}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <Hash size={20} className="text-white" />
              </div>
              {to === 'all' && messages.filter(m => m.to === 'all' || !m.to).length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">
                    {messages.filter(m => m.to === 'all' || !m.to).length}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">General</p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {messages.filter(m => m.to === 'all' || !m.to).length > 0 && 
                    new Date(Math.max(...messages.filter(m => m.to === 'all' || !m.to).map(m => m.time || 0))).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {messages.filter(m => m.to === 'all' || !m.to).length > 0 
                  ? messages.filter(m => m.to === 'all' || !m.to).slice(-1)[0].text
                  : 'No messages yet'
                }
              </p>
            </div>
          </div>

          {/* Conversations Section */}
          <div className="mt-6 mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Conversations</span>
          </div>

          {/* Individual Users */}
          {users.filter(u => u !== user).map(u => {
            const userMessages = messages.filter(m => 
              (m.from === user && m.to === u) || (m.from === u && m.to === user)
            );
            const lastMessage = userMessages.slice(-1)[0];
            
            return (
              <div 
                key={u}
                className={`flex items-center p-3 rounded-xl cursor-pointer mb-2 transition-all duration-200 ${
                  to === u 
                    ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setTo(u)}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    {u === "Admin" ? (
                      <AvatarImage src="/kamogelo-photo.jpg" alt="Admin" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white font-semibold">
                        {u.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  {userMessages.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{userMessages.length}</span>
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{u}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {lastMessage && new Date(lastMessage.time || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {lastMessage ? lastMessage.text : 'Start a conversation'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area - Full width on mobile, alongside sidebar on desktop */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Mobile Header (only visible on mobile) */}
        <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {/* Mobile Top Bar */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white font-semibold">
                  {user.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold">{user}</h1>
                <p className="text-sm text-green-600 dark:text-green-400">● At work</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button size="sm" variant="ghost">
                <Search size={18} />
              </Button>
              <Button size="sm" variant="ghost">
                <MoreVertical size={18} />
              </Button>
            </div>
          </div>

          {/* Mobile Chat Title */}
          <div className="px-4 pb-2">
            <h2 className="text-2xl font-bold mb-3">Chat</h2>
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button className="flex-1 py-2 px-3 text-sm font-medium bg-white dark:bg-gray-600 text-gray-900 dark:text-white rounded-md shadow-sm">
                All
              </button>
              <button className="flex-1 py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Work
              </button>
              <button className="flex-1 py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Personal
              </button>
              <button className="flex-1 py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Archive
              </button>
            </div>
          </div>

          {/* Mobile Chat List */}
          <div className="px-4 pb-4">
            {/* Pinned Section */}
            <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
              <span>📌 Pinned</span>
            </div>

            {/* General Channel */}
            <div 
              className={`flex items-center p-3 rounded-xl cursor-pointer mb-3 ${
                to === 'all' 
                  ? 'bg-blue-50 dark:bg-blue-900/30' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setTo('all')}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Hash size={20} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">3</span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">General</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">9:41 AM</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Wanna lunch with me?</p>
              </div>
            </div>

            {/* Individual Users */}
            {users.filter(u => u !== user).map(u => (
              <div 
                key={u}
                className={`flex items-center p-3 rounded-xl cursor-pointer mb-3 ${
                  to === u 
                    ? 'bg-blue-50 dark:bg-blue-900/30' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setTo(u)}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    {u === "Admin" ? (
                      <AvatarImage src="/kamogelo-photo.jpg" alt="Admin" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white font-semibold">
                        {u.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{u}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">9:34 AM</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Photo</p>
                </div>
              </div>
            ))}

            {/* Conversations Section */}
            <div className="mt-4 mb-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Conversation</span>
            </div>
          </div>
        </div>

        {/* Desktop Chat Header (only visible on desktop) */}
        <div className="hidden lg:flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center space-x-3">
            {to === 'all' ? (
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <Hash size={20} className="text-white" />
              </div>
            ) : (
              <Avatar className="w-10 h-10">
                {to === "Admin" ? (
                  <AvatarImage src="/kamogelo-photo.jpg" alt="Admin" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white font-semibold">
                    {to.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {to === 'all' ? 'General' : to}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {to === 'all' ? `${users.length + 1} members` : 'Active now'}
              </p>
            </div>
          </div>
        </div>
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
        {/* Messages Area - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:flex lg:flex-col lg:flex-1 lg:min-h-0 bg-white dark:bg-gray-800">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 chat-messages" style={{ overscrollBehavior: 'contain' }}>
            {messages
              .filter(msg =>
                to === 'all'
                  ? msg.to === 'all' || !msg.to
                  : (msg.from === user && msg.to === to) || (msg.from === to && msg.to === user)
              )
              .map(msg => (
                <div key={msg.id} className="flex items-start space-x-4 message-enter">
                  {/* Avatar */}
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    {msg.from === "Admin" ? (
                      <AvatarImage src="/kamogelo-photo.jpg" alt="Admin" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {(msg.from === user ? 'You' : msg.from).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {msg.from === user ? 'You' : msg.from}
                      </span>
                      {msg.from === "Admin" && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          Admin
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl px-4 py-3 border border-gray-100 dark:border-gray-600 max-w-2xl">
                      <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed break-words">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Desktop Message Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex items-end space-x-4">
              {isAdmin && (
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src="/kamogelo-photo.jpg" alt="Admin" />
                </Avatar>
              )}
              
              <div className="flex-1 relative">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 p-4">
                  <Input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={`Message ${to === 'all' ? 'General' : to}...`}
                    className="border-0 bg-transparent p-0 text-base placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                    style={{ fontSize: 16 }}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <Paperclip size={16} className="text-gray-500 dark:text-gray-400" />
                      </Button>
                      <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <Smile size={16} className="text-gray-500 dark:text-gray-400" />
                      </Button>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={!input.trim()} 
                      size="sm" 
                      className="h-9 px-4 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 safe-area-pb">
          <div className="flex items-center justify-around">
            <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto py-2">
              <MessageCircle size={20} className="text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Chats</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto py-2">
              <Users size={20} className="text-gray-400" />
              <span className="text-xs text-gray-400">People</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto py-2">
              <Phone size={20} className="text-gray-400" />
              <span className="text-xs text-gray-400">Calls</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto py-2">
              <Settings size={20} className="text-gray-400" />
              <span className="text-xs text-gray-400">Settings</span>
            </Button>
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
