"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Github, Globe, Mail, MapPin, MessageCircle, Send, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// WhatsApp-style chat message type
type Message = {
  id: string;
  content: string;
  sender: 'user' | 'me';
  timestamp: number;
}

const SECTIONS = [
  { key: 'chat', label: 'Chat' },
  { key: 'info', label: 'Contact Info' },
]

export default function Contact() {
  // WhatsApp-style chat state
  const [inputMessage, setInputMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  // Section navigation
  const [sectionIndex, setSectionIndex] = useState(0)

  // Telegram bot config
  const TELEGRAM_BOT_TOKEN = "-7967827699:AAE9xjyzzIkkHKh4IrFnNV6OYcGeJlkWVNo"
  const TELEGRAM_CHAT_ID = null // Will be set after first message
  const [chatId, setChatId] = useState<string | null>(null)

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll for new messages from Telegram (simulate live)
  useEffect(() => {
    if (!chatId) return
    let lastMessageId: number | null = null
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?timeout=5`)
        const data = await res.json()
        if (data.result && data.result.length > 0) {
          const updates = data.result
          const lastUpdate = updates[updates.length - 1]
          if (lastUpdate.message && lastUpdate.message.chat && lastUpdate.message.chat.id.toString() === chatId) {
            if (!lastMessageId || lastUpdate.message.message_id > lastMessageId) {
              lastMessageId = lastUpdate.message.message_id
              // Only add if not already in messages
              if (!messages.some(m => m.id === lastUpdate.message.message_id.toString())) {
                setMessages(prev => [...prev, {
                  id: lastUpdate.message.message_id.toString(),
                  content: lastUpdate.message.text,
                  sender: 'me',
                  timestamp: lastUpdate.message.date * 1000,
                }])
              }
            }
          }
        }
      } catch {}
    }, 2000)
    return () => clearInterval(interval)
  }, [chatId, messages])

  // Send message to Telegram
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return
    setLoading(true)
    try {
      // Send message to bot (user -> you)
      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId || '',
          text: inputMessage,
        })
      })
      const data = await res.json()
      if (data.ok) {
        setMessages(prev => [...prev, {
          id: data.result.message_id.toString(),
          content: inputMessage,
          sender: 'user',
          timestamp: Date.now(),
        }])
        setInputMessage("")
        if (!chatId) setChatId(data.result.chat.id.toString())
      }
    } catch {}
    setLoading(false)
  }


  return (
    <section id="contact" className="py-16 sm:py-20 px-4 md:px-6 lg:px-8 scroll-mt-16">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
          className="text-center mb-12"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
          >
            Get In Touch
          </motion.h2>
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="h-1 w-24 bg-gradient-to-r from-primary to-primary/50 mx-auto rounded-full"
          />
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-6 text-base sm:text-lg text-muted-foreground/90 max-w-2xl mx-auto px-4 leading-relaxed"
          >
            Have a project in mind or want to discuss opportunities? I'd love to hear from you.
          </motion.p>
        </motion.div>

        <div className="flex flex-col items-center min-h-[400px] relative pb-safe">
          {/* Section tabs */}
          <div className="mb-4 sm:mb-6 flex gap-2 sm:gap-4 justify-center">
            <Button
              variant={sectionIndex === 0 ? "default" : "outline"}
              onClick={() => setSectionIndex(0)}
              size="sm"
              className="text-sm"
            >
              Chat
            </Button>
            <Button
              variant={sectionIndex === 1 ? "default" : "outline"}
              onClick={() => setSectionIndex(1)}
              size="sm"
              className="text-sm"
            >
              Contact Info
            </Button>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {sectionIndex === 0 && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "-100%" }}
                transition={{ duration: 0.5, type: 'tween', ease: 'easeInOut' }}
                className="w-full flex justify-center absolute"
              >
                <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm">
                  <CardContent className="p-0 flex flex-col h-[500px] sm:h-[500px] max-h-[70vh]">
                    {/* Chat header */}
                    <motion.div
                      initial={{ opacity: 0, y: -30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5 flex items-center gap-3"
                    >
                      <Avatar className="h-10 w-10">
                        <User className="h-6 w-6 text-primary" />
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-base">Chat with Kamogelo</h3>
                        <p className="text-xs text-muted-foreground">WhatsApp-style chat</p>
                      </div>
                    </motion.div>
                    {/* Chat messages */}
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto bg-gradient-to-b from-muted/5 to-muted/10 p-2 sm:p-4 min-h-0">
                      {messages.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                          className="text-center text-muted-foreground/80 mt-20 p-6 rounded-lg border border-dashed border-primary/20"
                        >
                          <MessageCircle className="w-8 h-8 mx-auto mb-3 text-primary/50" />
                          Say hi to start chatting!
                        </motion.div>
                      )}
                      <AnimatePresence initial={false}>
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, x: message.sender === 'user' ? 60 : -60 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: message.sender === 'user' ? 60 : -60 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                              {/* Avatar */}
                              <div className="flex-shrink-0">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                  message.sender === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}>
                                  <User size={14} />
                                </div>
                              </div>
                              {/* Message bubble */}
                              <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                className={`py-2 px-3 rounded-lg text-sm ${
                                  message.sender === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                    : 'bg-muted rounded-tl-none'
                                }`}
                              >
                                <span>{message.content}</span>
                                <span className="text-xs opacity-70 mt-1 block text-right">
                                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </motion.div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>
                    {/* Chat input */}
                    <motion.form
                      onSubmit={handleSendMessage}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="p-2 sm:p-3 border-t flex gap-2 bg-white dark:bg-zinc-900 shrink-0"
                    >
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 text-sm sm:text-base"
                        autoFocus={false}
                      />
                      <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!inputMessage.trim() || loading}
                        className="bg-gradient-to-r from-primary to-primary/90 hover:shadow-md transition-shadow duration-200"
                      >
                        <Send size={16} className={loading ? "animate-pulse" : ""} />
                      </Button>
                    </motion.form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {sectionIndex === 1 && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "-100%" }}
                transition={{ duration: 0.5, type: 'tween', ease: 'easeInOut' }}
                className="w-full flex justify-center absolute"
              >
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold mb-6">Connect With Me</h3>
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="p-2 sm:p-3 rounded-full bg-primary/10 text-primary shrink-0">
                          <Mail className="h-4 w-4 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm sm:text-base">Email</h4>
                          <a
                            href="mailto:kamogelomosia@mail.com"
                            className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors break-all"
                          >
                            kamogelomosia@mail.com
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600 shrink-0">
                          <MessageCircle className="h-4 w-4 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm sm:text-base">WhatsApp</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-muted-foreground">069 843 9670</span>
                            <Button
                              size="sm"
                              onClick={() => {
                                const message = encodeURIComponent("Hi Kamogelo! I found your portfolio and would like to connect.")
                                window.open(`https://wa.me/27698439670?text=${message}`, "_blank")
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                            >
                              Chat Now
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="p-2 sm:p-3 rounded-full bg-primary/10 text-primary shrink-0">
                          <Github className="h-4 w-4 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm sm:text-base">GitHub</h4>
                          <a
                            href="https://github.com/kamocodes"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors break-all"
                          >
                            github.com/kamocodes
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="p-2 sm:p-3 rounded-full bg-primary/10 text-primary shrink-0">
                          <Globe className="h-4 w-4 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm sm:text-base">Website</h4>
                          <a
                            href="https://kamocodes.xyz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors break-all"
                          >
                            kamocodes.xyz
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="p-2 sm:p-3 rounded-full bg-primary/10 text-primary shrink-0">
                          <MapPin className="h-4 w-4 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm sm:text-base">Location</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">Kempton Park, Johannesburg</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
