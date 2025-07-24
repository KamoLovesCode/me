"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Home, User, Briefcase, Code, Mail } from "lucide-react"

const sections = [
  { id: "hero", label: "Home", icon: Home },
  { id: "about", label: "About", icon: User },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Projects", icon: Code },
]

export default function SectionNavigator() {
  const [activeSection, setActiveSection] = useState("hero")

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Check initial position

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
      <div className="flex flex-col space-y-2 bg-background/80 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
        {sections.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id
          
          return (
            <motion.button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`
                relative p-3 rounded-md transition-all duration-200 group
                ${isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={section.label}
            >
              <Icon className="w-4 h-4" />
              
              {/* Tooltip */}
              <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {section.label}
              </span>
              
              {/* Progress indicator */}
              {isActive && (
                <motion.div
                  className="absolute left-0 top-0 h-full w-1 bg-accent rounded-full"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
