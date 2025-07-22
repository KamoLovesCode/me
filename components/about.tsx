"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function About() {
  return (
    <section id="about" className="py-16 sm:py-20 px-4 md:px-6 lg:px-8 scroll-mt-16">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">About Me</h2>
          <div className="h-1 w-20 bg-primary mx-auto"></div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardContent className="p-4 sm:p-6">
                <p className="text-base sm:text-lg mb-4">
                  I'm Kamogelo Mosia, a recent BSc Computer Science graduate from the University of Johannesburg. With a
                  strong foundation in programming and hands-on experience in customer service, I bring both technical
                  skills and excellent communication abilities to every project.
                </p>
                <p className="text-base sm:text-lg mb-4">
                  Based in Kempton Park, Johannesburg, I'm passionate about software development and eager to contribute
                  to innovative projects. My experience in fast-paced retail environments has taught me the importance
                  of reliability, attention to detail, and customer-focused solutions.
                </p>
                <div className="flex flex-wrap gap-2 mt-6">
                  <Badge variant="outline" className="text-xs sm:text-sm">
                    Recent Graduate
                  </Badge>
                  <Badge variant="outline" className="text-xs sm:text-sm">
                    Customer Service Expert
                  </Badge>
                  <Badge variant="outline" className="text-xs sm:text-sm">
                    Fast Learner
                  </Badge>
                  <Badge variant="outline" className="text-xs sm:text-sm">
                    Team Player
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
            className="relative h-[250px] sm:h-[300px] md:h-[400px] rounded-lg overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-lg"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-4">My Mission</h3>
                <p className="text-sm sm:text-base lg:text-lg">
                  To leverage my computer science education and customer service experience to create user-friendly
                  applications that solve real-world problems while continuously growing as a developer.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
