"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Github, Globe, Mail, MapPin, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Contact() {
  // LiveChat widget integration
  const liveChatRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // Prevent duplicate script injection
    if (document.getElementById('livechat-script')) return
    const script = document.createElement('script')
    script.id = 'livechat-script'
    script.async = true
    // Replace LICENSE_ID with your actual LiveChat license ID
    script.innerHTML = `
      window.__lc = window.__lc || {};
      window.__lc.license = 12345678; // TODO: Replace with your LiveChat license ID
      (function(n,t,c){function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}var e={_q:[],_h:null,_v:"2.0",on:function(){i(["on", [].slice.call(arguments)])},once:function(){i(["once",[].slice.call(arguments)])},off:function(){i(["off",[].slice.call(arguments)])},get:function(){if(!e._h)throw new Error("LiveChatWidget: the widget is not initialized yet");return i(["get",[].slice.call(arguments)])},call:function(){i(["call",[].slice.call(arguments)])},init:function(){var n=t.createElement("script");n.async=!0,n.type="text/javascript",n.src="https://cdn.livechatinc.com/tracking.js",t.head.appendChild(n)} };!n.__lc.asyncInit&&e.init(),n.LiveChatWidget=n.LiveChatWidget||e })(window,document,[]);
    `
    if (liveChatRef.current) {
      liveChatRef.current.appendChild(script)
    } else {
      document.body.appendChild(script)
    }
    return () => {
      // Optionally clean up
      script.remove()
    }
  }, [])
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardContent className="p-4 sm:p-6">
                {/* Mini LiveChat widget only */}
                <div
                  ref={liveChatRef}
                  className="w-full h-80 border rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow"
                  style={{ position: 'relative', minHeight: 320 }}
                  aria-label="LiveChat Mini Chat"
                >
                  {/* LiveChat widget will be injected here */}
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Loading chat...
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

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
