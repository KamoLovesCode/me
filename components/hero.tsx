"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 leading-tight">
          <span className="text-primary">Kamogelo</span> Mosia
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 px-4">
          BSc Computer Science Graduate | Aspiring Full-Stack Developer
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
          <Button
            size="lg"
            className="w-full sm:w-auto text-base py-3 px-6"
            onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
          >
            View Projects
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto text-base py-3 px-6 bg-transparent"
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
          >
            Contact Me
          </Button>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 hidden sm:block"
      >
        <Button variant="ghost" size="icon" onClick={scrollToAbout} className="animate-bounce">
          <ArrowDown className="h-6 w-6" />
        </Button>
      </motion.div>
    </section>
  )
}
