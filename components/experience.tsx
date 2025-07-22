"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Experience = {
  company: string
  position: string
  period: string
  description: string
  technologies: string[]
  responsibilities: string[]
}

export default function Experience() {
  const experiences: Experience[] = [
    {
      company: "University of Johannesburg",
      position: "BSc Computer Science Student",
      period: "2021 - July 2025",
      description:
        "Completed comprehensive computer science degree covering programming, algorithms, data structures, and software engineering principles.",
      technologies: ["JavaScript", "Python", "HTML/CSS", "React", "Node.js", "SQL"],
      responsibilities: [
        "Developed multiple web applications using modern JavaScript frameworks",
        "Implemented algorithms and data structures in various programming languages",
        "Collaborated on group projects using version control systems",
        "Created database-driven applications with proper design patterns",
        "Participated in code reviews and software testing practices",
      ],
    },
    {
      company: "Dischem",
      position: "Cashier",
      period: "Jan 2020 - Dec 2020",
      description:
        "Provided excellent customer service in a high-volume retail environment during the COVID-19 pandemic.",
      technologies: ["POS Systems", "Customer Service", "Cash Management", "Problem Solving"],
      responsibilities: [
        "Handled high-volume transactions quickly and accurately",
        "Assisted customers with product inquiries and resolved complaints",
        "Maintained a neat and professional checkout area",
        "Built rapport with customers during challenging times",
        "Demonstrated reliability and professionalism under pressure",
      ],
    },
    {
      company: "F Stop Photo Labs",
      position: "Cashier",
      period: "Oct 2020 - Nov 2020",
      description: "Managed photo printing services and customer transactions in a specialized retail environment.",
      technologies: ["Photo Processing Systems", "Customer Service", "Payment Processing"],
      responsibilities: [
        "Processed photo printing orders and provided product assistance",
        "Managed payments and daily cash balancing",
        "Explained services clearly and answered customer questions",
        "Supported team efficiency and customer satisfaction",
        "Maintained attention to detail in order processing",
      ],
    },
  ]

  return (
    <section id="experience" className="py-16 sm:py-20 px-4 md:px-6 lg:px-8 bg-muted/50 scroll-mt-16">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Work Experience</h2>
          <div className="h-1 w-20 bg-primary mx-auto"></div>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            My professional journey building real-world applications
          </p>
        </motion.div>

        <div className="space-y-6 sm:space-y-8">
          {experiences.map((exp, index) => (
            <motion.div
              key={`${exp.company}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">{exp.position}</CardTitle>
                      <div className="text-base sm:text-lg font-medium text-primary">{exp.company}</div>
                    </div>
                    <Badge variant="outline" className="w-fit text-xs sm:text-sm">
                      {exp.period}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm sm:text-base">{exp.description}</p>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Technologies:</h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {exp.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Key Responsibilities:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {exp.responsibilities.map((resp, i) => (
                        <li key={i} className="text-xs sm:text-sm">
                          {resp}
                        </li>
                      ))}
                    </ul>
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
