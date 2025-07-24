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

// Import the peer chat system
let PeerChatSystem: any = null;
if (typeof window !== 'undefined') {
  PeerChatSystem = require('@/lib/peer-chat').default;
}


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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Peer chat system
  const chatSystem = useRef<any>(null)
  
  // User color assignment
  const [userColor, setUserColor] = useState<string>("")
  const [onlineUsers, setOnlineUsers] = useState<Array<{name: string, color: string, email: string, phone: string}>>([])
  
  // Message permissions
  const [pendingRequests, setPendingRequests] = useState<Array<{from: string, to: string, message: string, id: string}>>([])
  const [allowedContacts, setAllowedContacts] = useState<string[]>([])
  const [showPermissionDialog, setShowPermissionDialog] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<{from: string, message: string, id: string} | null>(null)

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

  // Generate a random color for the user
  const generateUserColor = () => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
      'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-rose-500'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const registerUser = () => {
    if (!validateUserRegistration()) return
    
    const assignedColor = generateUserColor()
    const newUser = {
      id: Date.now().toString(),
      name: userInfo.name.trim(),
      email: userInfo.email.trim().toLowerCase(),
      phone: userInfo.phone.trim(),
      company: userInfo.company.trim(),
      joinedAt: new Date().toISOString(),
      color: assignedColor
    }
    
    const updatedPhonebook = [...phonebook, newUser]
    setPhonebook(updatedPhonebook)
    localStorage.setItem('chat-phonebook', JSON.stringify(updatedPhonebook))
    localStorage.setItem('chat-username', newUser.name)
    localStorage.setItem('user-color', assignedColor)
    
    setUser(newUser.name)
    setUserColor(assignedColor)
    setShowUserRegistration(false)
    
    // Initialize peer chat system
    if (typeof window !== 'undefined' && PeerChatSystem) {
      chatSystem.current = new PeerChatSystem()
      
      // Set up event handlers
      chatSystem.current.onNewMessage = (message: Message) => {
        setMessages(prev => [...prev, message])
      }
      
      chatSystem.current.onUsersUpdate = (users: any[]) => {
        setOnlineUsers(users)
        setUsers(users.map(u => u.name))
      }
      
      chatSystem.current.onPermissionRequest = (from: string, text: string, requestId?: string) => {
        setCurrentRequest({ from, message: text, id: requestId || Date.now().toString() })
        setShowPermissionDialog(true)
      }
      
      chatSystem.current.onPermissionGranted = (from: string) => {
        setAllowedContacts(prev => [...prev, from])
      }
      
      // Join the chat system
      const onlineUsersList = chatSystem.current.join(newUser.name, assignedColor, newUser.email, newUser.phone)
      setOnlineUsers(onlineUsersList)
      setUsers(onlineUsersList.map(u => u.name))
      
      // Load existing messages
      const existingMessages = chatSystem.current.getMessages()
      setMessages(existingMessages)
      
      // Start heartbeat
      chatSystem.current.startHeartbeat()
    }
  }

  // Load chat history for this user from localStorage - but always require re-registration
  useEffect(() => {
    // Clear previous session data to force re-registration
    localStorage.removeItem('chat-username')
    localStorage.removeItem('user-color')
    setShowUserRegistration(true)
  }, [])

  // Connect to Peer Chat System
  useEffect(() => {
    // Cleanup function
    return () => {
      if (chatSystem.current) {
        chatSystem.current.leave()
        chatSystem.current = null
      }
    }
  }, [user])

  useEffect(() => {
    // Always scroll to bottom on new message, even if not focused
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleVoiceTranscript = (transcript: string) => {
    // Add the voice transcript as a message
    if (chatSystem.current && user) {
      chatSystem.current.sendMessage(to, `🎤 ${transcript}`)
    }
  }

  const sendMessage = () => {
    if (!input.trim() || !chatSystem.current) return
    
    const success = chatSystem.current.sendMessage(to, input)
    if (success) {
      setInput("")
    }
  }

  const handlePermissionResponse = (granted: boolean) => {
    if (currentRequest && chatSystem.current) {
      chatSystem.current.handlePermissionResponse(currentRequest.from, granted, currentRequest.id)
      
      if (granted) {
        setAllowedContacts(prev => [...prev, currentRequest.from])
      }
    }
    
    setShowPermissionDialog(false)
    setCurrentRequest(null)
  }

  if (showUserRegistration) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black p-4">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-center mb-2 text-black dark:text-white">Join the Chat</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
            Please provide your information to start chatting. You'll be assigned a unique color.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block text-black dark:text-white">Full Name *</label>
              <Input
                placeholder="John Doe"
                value={userInfo.name}
                onChange={e => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-black dark:text-white ${registrationErrors.some(e => e.includes('Name')) ? 'border-red-500' : ''}`}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block text-black dark:text-white">Email Address *</label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={userInfo.email}
                onChange={e => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-black dark:text-white ${registrationErrors.some(e => e.includes('email')) ? 'border-red-500' : ''}`}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block text-black dark:text-white">Phone Number *</label>
              <Input
                placeholder="+1 (555) 123-4567"
                value={userInfo.phone}
                onChange={e => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-black dark:text-white ${registrationErrors.some(e => e.includes('phone')) ? 'border-red-500' : ''}`}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block text-black dark:text-white">Company/Organization *</label>
              <Input
                placeholder="Acme Corp"
                value={userInfo.company}
                onChange={e => setUserInfo(prev => ({ ...prev, company: e.target.value }))}
                className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-black dark:text-white ${registrationErrors.some(e => e.includes('Company')) ? 'border-red-500' : ''}`}
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
              className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
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
    <div className="flex h-screen bg-white dark:bg-black">
      {/* Desktop: Side-by-side layout, Mobile: Stacked layout */}
      
      {/* Left Sidebar - Desktop only */}
      <div className="hidden lg:flex lg:flex-col lg:w-80 xl:w-96 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className={`${userColor} text-white font-semibold`}>
                {user.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-semibold text-black dark:text-white">{user}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">● Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {isAdmin && (
              <Button size="sm" variant="ghost" onClick={() => setShowPhonebook(true)} className="text-black dark:text-white">
                <Phone size={16} />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setShowAdminLogin(true)} className="text-black dark:text-white">
              <UserCog size={16} />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => {
              setUser("");
              setIsAdmin(false);
              localStorage.removeItem('chat-username');
              localStorage.removeItem('user-color');
              window.location.href = "/";
            }} className="text-black dark:text-white">
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Chat Title */}
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Chats</h2>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search conversations" className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white" />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* General Channel */}
          <div 
            className={`flex items-center p-3 rounded-xl cursor-pointer mb-2 transition-all duration-200 ${
              to === 'all' 
                ? 'bg-black dark:bg-white text-white dark:text-black' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white'
            }`}
            onClick={() => setTo('all')}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gray-600 dark:bg-gray-400 rounded-full flex items-center justify-center">
                <Hash size={20} className="text-white dark:text-black" />
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">General</p>
                <span className="text-xs opacity-60">
                  {messages.filter(m => m.to === 'all' || !m.to).length > 0 && 
                    new Date(Math.max(...messages.filter(m => m.to === 'all' || !m.to).map(m => m.time || 0))).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                </span>
              </div>
              <p className="text-xs opacity-60 truncate">
                {messages.filter(m => m.to === 'all' || !m.to).length > 0 
                  ? messages.filter(m => m.to === 'all' || !m.to).slice(-1)[0].text
                  : 'No messages yet'
                }
              </p>
            </div>
          </div>

          {/* Online Users Section */}
          <div className="mt-6 mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Online Users</span>
          </div>

          {/* Individual Users */}
          {users.filter(u => u !== user).map(u => {
            const userMessages = messages.filter(m => 
              (m.from === user && m.to === u) || (m.from === u && m.to === user)
            );
            const lastMessage = userMessages.slice(-1)[0];
            const onlineUser = onlineUsers.find(ou => ou.name === u);
            
            return (
              <div 
                key={u}
                className={`flex items-center p-3 rounded-xl cursor-pointer mb-2 transition-all duration-200 ${
                  to === u 
                    ? 'bg-black dark:bg-white text-white dark:text-black' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white'
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
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-black rounded-full"></div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{u}</p>
                    {!allowedContacts.includes(u) && u !== 'Admin' && (
                      <Badge variant="outline" className="text-xs border-gray-400">
                        Request access
                      </Badge>
                    )}
                    <span className="text-xs opacity-60">
                      {lastMessage && new Date(lastMessage.time || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs opacity-60 truncate">
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
        <div className="lg:hidden bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
          {/* Mobile Top Bar */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className={`${userColor} text-white font-semibold`}>
                  {user.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold text-black dark:text-white">{user}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">● Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button size="sm" variant="ghost" className="text-black dark:text-white">
                <Search size={18} />
              </Button>
              <Button size="sm" variant="ghost" className="text-black dark:text-white">
                <MoreVertical size={18} />
              </Button>
            </div>
          </div>

          {/* Mobile Chat Title */}
          <div className="px-4 pb-4">
            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Chats</h2>
          </div>

          {/* Mobile Chat List */}
          <div className="px-4 pb-4">
            {/* General Channel */}
            <div 
              className={`flex items-center p-3 rounded-xl cursor-pointer mb-3 ${
                to === 'all' 
                  ? 'bg-black dark:bg-white text-white dark:text-black' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white'
              }`}
              onClick={() => setTo('all')}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gray-600 dark:bg-gray-400 rounded-full flex items-center justify-center">
                  <Hash size={20} className="text-white dark:text-black" />
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
                      ? 'bg-black dark:bg-white text-white dark:text-black' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white'
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
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-black rounded-full"></div>
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
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Online Users ({users.length})</span>
            </div>
          </div>
        </div>

        {/* Desktop Chat Header (only visible on desktop) */}
        <div className="hidden lg:flex bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center space-x-3">
            {to === 'all' ? (
              <div className="w-10 h-10 bg-gray-600 dark:bg-gray-400 rounded-full flex items-center justify-center">
                <Hash size={20} className="text-white dark:text-black" />
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
              <h2 className="text-lg font-semibold text-black dark:text-white">
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
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-xs flex flex-col gap-4 border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold text-center text-black dark:text-white">Admin Login</h2>
            <Input
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-black dark:text-white"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                onClick={() => {
                  if (adminPassword === "2255") {
                    setIsAdmin(true);
                    setShowAdminLogin(false);
                    setUser("Admin");
                    setUserColor("bg-purple-600");
                    setShowUserRegistration(false);
                  }
                }}
              >Login</Button>
              <Button 
                variant="outline" 
                className="flex-1 border-gray-300 dark:border-gray-600 text-black dark:text-white" 
                onClick={() => setShowAdminLogin(false)}
              >
                Cancel
              </Button>
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
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-bold text-black dark:text-white">User Phonebook</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowPhonebook(false)} className="text-black dark:text-white">
                <X size={16} />
              </Button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(80vh-120px)] p-4">
              {phonebook.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <p>No registered users yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {phonebook.map((entry) => (
                    <div key={entry.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold text-lg text-black dark:text-white">{entry.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{entry.company}</p>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-black dark:text-white">Email:</span>
                            <a href={`mailto:${entry.email}`} className="text-gray-600 dark:text-gray-400 hover:underline">
                              {entry.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-black dark:text-white">Phone:</span>
                            <a href={`tel:${entry.phone}`} className="text-gray-600 dark:text-gray-400 hover:underline">
                              {entry.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-black dark:text-white">Joined:</span>
                            <span className="text-gray-600 dark:text-gray-400">
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
            
            <div className="border-t border-gray-200 dark:border-gray-800 p-4">
              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <span>Total registered users: {phonebook.length}</span>
                <Button variant="outline" onClick={() => setShowPhonebook(false)} className="border-gray-300 dark:border-gray-600 text-black dark:text-white">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
        {/* Messages Area - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:flex lg:flex-col lg:flex-1 lg:min-h-0 bg-white dark:bg-black">
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
                        <span className="text-sm font-semibold text-black dark:text-white">
                          {msg.from === user ? 'You' : msg.from}
                        </span>
                        {msg.from === "Admin" && (
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-black dark:bg-gray-800 dark:text-white">
                            Admin
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700 max-w-2xl">
                        <p className="text-sm text-black dark:text-white leading-relaxed break-words">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            <div ref={messagesEndRef} />
          </div>

          {/* Desktop Message Input */}
          <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-6">
            <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex items-end space-x-4">
              {isAdmin && (
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src="/kamogelo-photo.jpg" alt="Admin" />
                </Avatar>
              )}
              
              <div className="flex-1 relative">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                  <Input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={`Message ${to === 'all' ? 'General' : to}...`}
                    className="border-0 bg-transparent p-0 text-base placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-black dark:text-white"
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
                      className="h-9 px-4 rounded-full bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 text-white dark:text-black font-medium"
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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 px-4 py-2 safe-area-pb">
          <div className="flex items-center justify-around">
            <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto py-2">
              <MessageCircle size={20} className="text-black dark:text-white" />
              <span className="text-xs text-black dark:text-white font-medium">Chats</span>
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
      
      {/* Permission Request Dialog */}
      {showPermissionDialog && currentRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Message Request
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <span className="font-medium text-black dark:text-white">{currentRequest.from}</span> wants to send you a message:
              </p>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-6">
                <p className="text-sm text-black dark:text-white break-words">
                  "{currentRequest.message}"
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => handlePermissionResponse(false)}
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-gray-600 text-black dark:text-white"
                >
                  Decline
                </Button>
                <Button
                  onClick={() => handlePermissionResponse(true)}
                  className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                >
                  Accept
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
