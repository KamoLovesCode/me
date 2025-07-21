"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Github, Code } from "lucide-react"
import CodeSnippet from "./code-snippet"

type Repository = {
  id: number
  name: string
  description: string
  html_url: string
  homepage: string
  topics: string[]
  language: string
}

export default function Projects() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  // Mock data for demonstration - in a real app, this would come from GitHub API
  useEffect(() => {
    // Simulating API fetch
    setTimeout(() => {
      setRepos([
        {
          id: 1,
          name: "E-Commerce Platform",
          description:
            "A full-stack e-commerce platform with product management, cart functionality, and payment processing.",
          html_url: "https://github.com/username/ecommerce",
          homepage: "https://ecommerce-demo.vercel.app",
          topics: ["react", "nextjs", "typescript", "prisma", "postgresql", "stripe"],
          language: "TypeScript",
        },
        {
          id: 2,
          name: "Task Management App",
          description: "A collaborative task management application with real-time updates and team workspaces.",
          html_url: "https://github.com/username/taskmanager",
          homepage: "https://taskmanager-demo.vercel.app",
          topics: ["react", "nodejs", "mongodb", "websockets", "authentication"],
          language: "JavaScript",
        },
        {
          id: 3,
          name: "Developer Blog",
          description: "A technical blog platform with markdown support, code syntax highlighting, and comment system.",
          html_url: "https://github.com/username/devblog",
          homepage: "https://devblog-demo.vercel.app",
          topics: ["nextjs", "mdx", "tailwindcss", "cms", "serverless"],
          language: "TypeScript",
        },
        {
          id: 4,
          name: "Real-time Chat Application",
          description: "A real-time messaging platform with private and group chats, file sharing, and notifications.",
          html_url: "https://github.com/username/chatapp",
          homepage: "https://chatapp-demo.vercel.app",
          topics: ["react", "firebase", "websockets", "authentication", "notifications"],
          language: "JavaScript",
        },
        {
          id: 5,
          name: "Portfolio Generator",
          description:
            "A tool for developers to create customizable portfolio websites from templates and GitHub data.",
          html_url: "https://github.com/username/portfolio-gen",
          homepage: "https://portfolio-gen-demo.vercel.app",
          topics: ["nextjs", "github-api", "tailwindcss", "templates", "customization"],
          language: "TypeScript",
        },
        {
          id: 6,
          name: "API Gateway Service",
          description: "A microservice gateway for routing, authentication, and rate limiting of backend services.",
          html_url: "https://github.com/username/api-gateway",
          homepage: "",
          topics: ["nodejs", "express", "microservices", "authentication", "rate-limiting"],
          language: "TypeScript",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const codeSnippets = {
    "E-Commerce Platform": `// Product data fetching with SWR and TypeScript
import useSWR from 'swr'
import { Product } from '@/types'

export function useProducts(category?: string) {
  const { data, error, isLoading } = useSWR<Product[]>(
    \`/api/products\${category ? \`?category=\${category}\` : ''}\`,
    fetcher
  )

  return {
    products: data || [],
    isLoading,
    isError: error
  }
}`,
    "Task Management App": `// Real-time task updates with WebSockets
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { Task, Workspace } from '@/types'

export function useTaskUpdates(workspaceId: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  
  useEffect(() => {
    const newSocket = io('/tasks')
    setSocket(newSocket)
    
    newSocket.emit('join', { workspaceId })
    
    newSocket.on('taskCreated', (task: Task) => {
      setTasks(prev => [...prev, task])
    })
    
    return () => {
      newSocket.disconnect()
    }
  }, [workspaceId])
  
  return { tasks }
}`,
    "Developer Blog": `// MDX rendering with code syntax highlighting
import { MDXRemote } from 'next-mdx-remote'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

const components = {
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '')
    return match ? (
      <SyntaxHighlighter
        language={match[1]}
        style={atomDark}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    )
  }
}

export default function BlogPost({ source }) {
  return <MDXRemote {...source} components={components} />
}`,
    "Real-time Chat Application": `// Firebase real-time messaging implementation
import { useEffect, useState } from 'react'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'

export function useChat(chatId) {
  const [messages, setMessages] = useState([])
  
  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt')
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMessages(newMessages)
    })
    
    return unsubscribe
  }, [chatId])
  
  return { messages }
}`,
    "Portfolio Generator": `// Dynamic template rendering with Next.js
import { useState, useEffect } from 'react'
import { getGithubData } from '@/lib/github'
import { generatePortfolio } from '@/lib/generator'

export default function PortfolioBuilder({ username, template }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchData() {
      try {
        const githubData = await getGithubData(username)
        setData(githubData)
      } catch (error) {
        console.error('Failed to fetch GitHub data', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [username])
  
  if (loading) return <div>Loading...</div>
  
  return generatePortfolio(data, template)
}`,
    "API Gateway Service": `// Express middleware for API rate limiting
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { createClient } from 'redis'

const client = createClient({
  url: process.env.REDIS_URL
})

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => client.sendCommand(args),
  }),
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests, please try again later.'
    })
  }
})

// Usage in Express app
app.use('/api/', apiLimiter)
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
`,
  }

  const filteredRepos =
    activeTab === "all" ? repos : repos.filter((repo) => repo.topics.includes(activeTab.toLowerCase()))

  return (
    <section id="projects" className="py-20 px-4 md:px-6 lg:px-8 scroll-mt-16">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Projects</h2>
          <div className="h-1 w-20 bg-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A selection of my recent full-stack development projects
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
              <div className="flex justify-center">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="react">React</TabsTrigger>
                  <TabsTrigger value="nextjs">Next.js</TabsTrigger>
                  <TabsTrigger value="nodejs">Node.js</TabsTrigger>
                  <TabsTrigger value="typescript">TypeScript</TabsTrigger>
                </TabsList>
              </div>
            </Tabs>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRepos.map((repo, index) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <span>{repo.name}</span>
                        <Badge variant="outline">{repo.language}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground mb-4">{repo.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {repo.topics.slice(0, 4).map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          document.getElementById(`code-${repo.id}`)?.scrollIntoView({ behavior: "smooth" })
                        }}
                      >
                        <Code className="mr-2 h-4 w-4" />
                        View Code Snippet
                      </Button>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" asChild>
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                          <Github className="mr-2 h-4 w-4" />
                          Source
                        </a>
                      </Button>
                      {repo.homepage && (
                        <Button variant="default" size="sm" asChild>
                          <a href={repo.homepage} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Demo
                          </a>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 space-y-12">
              <h3 className="text-2xl font-bold text-center mb-8">Code Snippets</h3>
              {filteredRepos.map((repo) => (
                <motion.div
                  key={`code-${repo.id}`}
                  id={`code-${repo.id}`}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="scroll-mt-24"
                >
                  <h4 className="text-xl font-semibold mb-4">{repo.name}</h4>
                  <CodeSnippet
                    code={codeSnippets[repo.name] || "// Code snippet not available"}
                    language={repo.language.toLowerCase()}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
