"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Database, Globe, Server, Cpu } from "lucide-react"

type Skill = {
  name: string
  proficiency: number
}

type SkillCategory = {
  name: string
  icon: React.ReactNode
  skills: Skill[]
}

export default function Skills() {
  const skillCategories: SkillCategory[] = [
    {
      name: "Frontend",
      icon: <Globe className="h-5 w-5 sm:h-6 sm:w-6" />,
      skills: [
        { name: "HTML/CSS", proficiency: 85 },
        { name: "JavaScript", proficiency: 75 },
        { name: "React", proficiency: 60 },
        { name: "Responsive Design", proficiency: 80 },
        { name: "UI/UX Basics", proficiency: 65 },
      ],
    },
    {
      name: "Backend",
      icon: <Server className="h-5 w-5 sm:h-6 sm:w-6" />,
      skills: [
        { name: "Node.js", proficiency: 60 },
        { name: "Python", proficiency: 70 },
        { name: "REST API", proficiency: 55 },
        { name: "Database Basics", proficiency: 60 },
        { name: "Server Concepts", proficiency: 65 },
      ],
    },
    {
      name: "Database",
      icon: <Database className="h-5 w-5 sm:h-6 sm:w-6" />,
      skills: [
        { name: "SQL Basics", proficiency: 65 },
        { name: "Database Design", proficiency: 60 },
        { name: "Data Structures", proficiency: 75 },
        { name: "Algorithms", proficiency: 70 },
        { name: "Problem Solving", proficiency: 85 },
      ],
    },
    {
      name: "DevOps",
      icon: <Cpu className="h-5 w-5 sm:h-6 sm:w-6" />,
      skills: [
        { name: "Git/GitHub", proficiency: 70 },
        { name: "VS Code", proficiency: 85 },
        { name: "Command Line", proficiency: 65 },
        { name: "Debugging", proficiency: 75 },
        { name: "Documentation", proficiency: 80 },
      ],
    },
  ]

  return (
    <section id="skills" className="py-16 sm:py-20 px-4 md:px-6 lg:px-8 bg-muted/50 scroll-mt-16">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Technical Skills</h2>
          <div className="h-1 w-20 bg-primary mx-auto"></div>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            My technical toolkit spans the entire development stack, enabling me to build complete solutions.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {skillCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">{category.icon}</div>
                    <h3 className="text-lg sm:text-xl font-semibold">{category.name}</h3>
                  </div>

                  <div className="space-y-4">
                    {category.skills.map((skill) => (
                      <div key={skill.name}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{skill.name}</span>
                          <span className="text-xs text-muted-foreground">{skill.proficiency}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.proficiency}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            viewport={{ once: true }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
