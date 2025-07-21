"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function About() {
  return (
    <section id="about" className="py-20 px-4 md:px-6 lg:px-8 scroll-mt-16">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">About Me</h2>
          <div className="h-1 w-20 bg-primary mx-auto"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardContent className="p-6">
                <p className="text-lg mb-4">
                  I'm a passionate full-stack developer with expertise in building modern web applications. With a
                  strong foundation in both frontend and backend technologies, I create seamless, user-focused
                  experiences that solve real-world problems.
                </p>
                <p className="text-lg mb-4">
                  My approach combines clean code principles with innovative solutions, ensuring applications are not
                  only functional but also maintainable and scalable.
                </p>
                <div className="flex flex-wrap gap-2 mt-6">
                  <Badge variant="outline" className="text-sm">
                    Problem Solver
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    Clean Code Advocate
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    Performance Optimizer
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    UX Enthusiast
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-lg"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6">
                <h3 className="text-2xl font-bold mb-4">My Mission</h3>
                <p className="text-lg">
                  To create elegant, efficient, and accessible web applications that deliver exceptional user
                  experiences while solving complex technical challenges.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
