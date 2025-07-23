"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar } from "@/components/ui/avatar"
import { Github, Globe, Mail, MapPin, MessageCircle, Send, User, Bot, ChevronDown, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Define chat message type
type Message = {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Predefined bot responses
const BOT_RESPONSES = [
  "Hi there! Thanks for reaching out. How can I help you today?",
  "I'm currently looking for junior developer roles or internships. Let me know if you have any opportunities!",
  "You can reach me via email at kamogelomosia@mail.com or WhatsApp at 069 843 9670.",
  "I specialize in React, Next.js, TypeScript, and Node.js. I'm always eager to learn new technologies!",
  "I'd be happy to discuss how my skills could benefit your project or team. When would be a good time to chat further?",
];

export default function Contact() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Chat state
  const [chatOpen, setChatOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! 👋 I'm Kamogelo's virtual assistant. Feel free to ask anything about my skills, experience, or projects!",
      sender: 'bot',
      timestamp: new Date(),
    }
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to bottom of chat when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Message sent!",
      description: "Thank you for reaching out. I'll get back to you soon.",
    })

    setFormData({ name: "", email: "", message: "" })
    setIsSubmitting(false)
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hi Kamogelo! I found your portfolio and would like to connect.")
    window.open(`https://wa.me/27698439670?text=${message}`, "_blank")
  }
  
  // Send message in chat
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    
    // Simulate bot thinking and respond after delay
    setTimeout(() => {
      // Get a random response or a more specific one based on keywords
      let botResponse = BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)]
      
      // Simple keyword matching for more relevant responses
      const lowercaseMsg = inputMessage.toLowerCase()
      if (lowercaseMsg.includes('job') || lowercaseMsg.includes('hire') || lowercaseMsg.includes('work')) {
        botResponse = BOT_RESPONSES[1]
      } else if (lowercaseMsg.includes('contact') || lowercaseMsg.includes('email') || lowercaseMsg.includes('reach')) {
        botResponse = BOT_RESPONSES[2]
      } else if (lowercaseMsg.includes('skill') || lowercaseMsg.includes('tech') || lowercaseMsg.includes('know')) {
        botResponse = BOT_RESPONSES[3]
      }
      
      const botMessage: Message = {
        id: Date.now().toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, botMessage])
    }, 1000)
  }

  return (
    <section id="contact" className="py-16 sm:py-20 px-4 md:px-6 lg:px-8 scroll-mt-16">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
          <div className="h-1 w-20 bg-primary mx-auto"></div>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Have a project in mind or want to discuss opportunities? I'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Chat UI Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="h-full">
              <CardContent className="p-0 overflow-hidden">
                {/* Chat header */}
                <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Bot size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Chat with my Assistant</h3>
                      <p className="text-xs text-muted-foreground">Ask me anything!</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => setChatOpen(!chatOpen)}
                    aria-label={chatOpen ? "Minimize chat" : "Expand chat"}
                  >
                    {chatOpen ? <X size={16} /> : <ChevronDown size={16} />}
                  </Button>
                </div>
                
                {chatOpen && (
                  <>
                    {/* Chat messages container */}
                    <div className="p-4 h-[320px] overflow-y-auto bg-muted/10">
                      {messages.map((message) => (
                        <div 
                          key={message.id} 
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
                                {message.sender === 'user' ? (
                                  <User size={14} />
                                ) : (
                                  <Bot size={14} />
                                )}
                              </div>
                            </div>
                            
                            {/* Message bubble */}
                            <div 
                              className={`py-2 px-3 rounded-lg ${
                                message.sender === 'user' 
                                  ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                  : 'bg-muted rounded-tl-none'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <span className="text-xs opacity-70 mt-1 block">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Chat input */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                      />
                      <Button type="submit" size="icon" disabled={!inputMessage.trim()}>
                        <Send size={16} />
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
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
                          onClick={handleWhatsAppClick}
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
        </div>
      </div>
    </section>
  )
}
