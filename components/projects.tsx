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
          name: "Personal Portfolio Website",
          description:
            "A responsive portfolio website built with Next.js and Tailwind CSS to showcase my skills and projects.",
          html_url: "https://github.com/kamocodes/portfolio",
          homepage: "https://kamocodes.xyz",
          topics: ["nextjs", "react", "tailwindcss", "typescript", "portfolio"],
          language: "TypeScript",
        },
        {
          id: 2,
          name: "Student Management System",
          description:
            "A web application for managing student records with CRUD operations, built as a university project.",
          html_url: "https://github.com/kamocodes/student-management",
          homepage: "",
          topics: ["javascript", "html", "css", "crud", "web-development"],
          language: "JavaScript",
        },
        {
          id: 3,
          name: "Calculator App",
          description: "A responsive calculator application with basic arithmetic operations and clean UI design.",
          html_url: "https://github.com/kamocodes/calculator",
          homepage: "https://kamocodes-calculator.vercel.app",
          topics: ["javascript", "html", "css", "calculator", "responsive"],
          language: "JavaScript",
        },
        {
          id: 4,
          name: "To-Do List Application",
          description: "A simple task management app with local storage functionality and intuitive user interface.",
          html_url: "https://github.com/kamocodes/todo-app",
          homepage: "https://kamocodes-todo.vercel.app",
          topics: ["javascript", "localstorage", "dom", "css", "productivity"],
          language: "JavaScript",
        },
        {
          id: 5,
          name: "Weather Dashboard",
          description:
            "A weather application that fetches real-time weather data using API integration and displays forecasts.",
          html_url: "https://github.com/kamocodes/weather-app",
          homepage: "https://kamocodes-weather.vercel.app",
          topics: ["javascript", "api", "weather", "fetch", "responsive"],
          language: "JavaScript",
        },
        {
          id: 6,
          name: "Python Data Analysis",
          description: "Data analysis scripts and visualizations using Python for academic projects and learning.",
          html_url: "https://github.com/kamocodes/python-analysis",
          homepage: "",
          topics: ["python", "data-analysis", "pandas", "matplotlib", "jupyter"],
          language: "Python",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const codeSnippets = {
    "Personal Portfolio Website": `// Responsive navigation component with mobile menu
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  
  const navItems = [
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' }
  ]
  
  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="text-xl font-bold">KamoCode</div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <a key={item.name} href={item.href} 
                 className="hover:text-primary transition-colors">
                {item.name}
              </a>
            ))}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map((item) => (
              <a key={item.name} href={item.href}
                 className="block py-2 hover:text-primary">
                {item.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}`,
    "Student Management System": `// Student CRUD operations with form validation
import { useState } from 'react'

export default function StudentForm({ onSubmit, student = null }) {
  const [formData, setFormData] = useState({
    name: student?.name || '',
    email: student?.email || '',
    course: student?.course || '',
    year: student?.year || ''
  })
  
  const [errors, setErrors] = useState({})
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.course.trim()) {
      newErrors.course = 'Course is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>
      
      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        {student ? 'Update' : 'Add'} Student
      </button>
    </form>
  )
}`,
    "Calculator App": `// Calculator with keyboard support and responsive design
import { useState, useEffect } from 'react'

export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState(null)
  const [operation, setOperation] = useState(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  
  const inputNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num))
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? String(num) : display + num)
    }
  }
  
  const inputOperation = (nextOperation) => {
    const inputValue = parseFloat(display)
    
    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = calculate(currentValue, inputValue, operation)
      
      setDisplay(String(newValue))
      setPreviousValue(newValue)
    }
    
    setWaitingForOperand(true)
    setOperation(nextOperation)
  }
  
  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+': return firstValue + secondValue
      case '-': return firstValue - secondValue
      case '×': return firstValue * secondValue
      case '÷': return firstValue / secondValue
      case '=': return secondValue
      default: return secondValue
    }
  }
  
  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        inputNumber(parseInt(e.key))
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        const ops = {'+': '+', '-': '-', '*': '×', '/': '÷'}
        inputOperation(ops[e.key])
      } else if (e.key === 'Enter' || e.key === '=') {
        inputOperation('=')
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [display, previousValue, operation, waitingForOperand])
  
  return (
    <div className="max-w-xs mx-auto bg-gray-800 rounded-lg p-4">
      <div className="bg-black text-white text-right text-2xl p-4 rounded mb-4">
        {display}
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {/* Calculator buttons */}
        <button onClick={() => inputNumber(7)} 
                className="bg-gray-600 hover:bg-gray-500 text-white p-4 rounded">
          7
        </button>
        {/* More buttons... */}
      </div>
    </div>
  )
}`,
    "To-Do List Application": `// Todo app with local storage and drag & drop
import { useState, useEffect } from 'react'

export default function TodoApp() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [filter, setFilter] = useState('all')
  
  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos')
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    }
  }, [])
  
  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])
  
  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      }
      setTodos([...todos, newTodo])
      setInputValue('')
    }
  }
  
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }
  
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }
  
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })
  
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Todo List</h1>
      
      <div className="flex mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
          className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2"
        />
        <button
          onClick={addTodo}
          className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600"
        >
          Add
        </button>
      </div>
      
      <div className="flex justify-center mb-4 space-x-2">
        {['all', 'active', 'completed'].map(filterType => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={\`px-3 py-1 rounded \${filter === filterType ? 'bg-blue-500 text-white' : 'bg-gray-200'}\`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>
      
      <ul className="space-y-2">
        {filteredTodos.map(todo => (
          <li key={todo.id} className="flex items-center p-2 border rounded">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="mr-3"
            />
            <span className={\`flex-1 \${todo.completed ? 'line-through text-gray-500' : ''}\`}>
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}`,
    "Weather Dashboard": `// Weather app with geolocation and 5-day forecast
import { useState, useEffect } from 'react'

export default function WeatherDashboard() {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [city, setCity] = useState('')
  
  const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY
  
  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      const response = await fetch(
        \`https://api.openweathermap.org/data/2.5/weather?lat=\${lat}&lon=\${lon}&appid=\${API_KEY}&units=metric\`
      )
      const data = await response.json()
      setWeather(data)
      
      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        \`https://api.openweathermap.org/data/2.5/forecast?lat=\${lat}&lon=\${lon}&appid=\${API_KEY}&units=metric\`
      )
      const forecastData = await forecastResponse.json()
      setForecast(forecastData.list.filter((_, index) => index % 8 === 0).slice(0, 5))
      
    } catch (err) {
      setError('Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }
  
  const fetchWeatherByCity = async (cityName) => {
    try {
      setLoading(true)
      const response = await fetch(
        \`https://api.openweathermap.org/data/2.5/weather?q=\${cityName}&appid=\${API_KEY}&units=metric\`
      )
      const data = await response.json()
      
      if (response.ok) {
        setWeather(data)
        fetchWeatherByCoords(data.coord.lat, data.coord.lon)
      } else {
        setError('City not found')
      }
    } catch (err) {
      setError('Failed to fetch weather data')
    }
  }
  
  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude)
        },
        () => {
          // Default to Johannesburg if geolocation fails
          fetchWeatherByCity('Johannesburg')
        }
      )
    } else {
      fetchWeatherByCity('Johannesburg')
    }
  }, [])
  
  const handleSearch = (e) => {
    e.preventDefault()
    if (city.trim()) {
      fetchWeatherByCity(city)
      setCity('')
    }
  }
  
  if (loading) return <div className="text-center p-8">Loading weather data...</div>
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
            className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 rounded-r">
            Search
          </button>
        </div>
      </form>
      
      {weather && (
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">{weather.name}</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold">{Math.round(weather.main.temp)}°C</p>
              <p className="capitalize">{weather.weather[0].description}</p>
            </div>
            <div className="text-right">
              <p>Feels like {Math.round(weather.main.feels_like)}°C</p>
              <p>Humidity: {weather.main.humidity}%</p>
              <p>Wind: {weather.wind.speed} m/s</p>
            </div>
          </div>
        </div>
      )}
      
      {forecast.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">5-Day Forecast</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {forecast.map((day, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow text-center">
                <p className="font-semibold">
                  {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className="text-2xl font-bold">{Math.round(day.main.temp)}°C</p>
                <p className="text-sm capitalize">{day.weather[0].description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}`,
    "Python Data Analysis": `# Data analysis and visualization with pandas and matplotlib
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

class DataAnalyzer:
    def __init__(self, data_file):
        """Initialize the analyzer with a data file"""
        self.df = pd.read_csv(data_file)
        self.setup_plotting()
    
    def setup_plotting(self):
        """Configure matplotlib and seaborn for better plots"""
        plt.style.use('seaborn-v0_8')
        sns.set_palette("husl")
        plt.rcParams['figure.figsize'] = (12, 8)
        plt.rcParams['font.size'] = 12
    
    def basic_info(self):
        """Display basic information about the dataset"""
        print("Dataset Shape:", self.df.shape)
        print("\\nColumn Info:")
        print(self.df.info())
        print("\\nBasic Statistics:")
        print(self.df.describe())
        print("\\nMissing Values:")
        print(self.df.isnull().sum())
    
    def correlation_analysis(self, figsize=(10, 8)):
        """Create correlation heatmap for numerical columns"""
        numerical_cols = self.df.select_dtypes(include=[np.number]).columns
        
        if len(numerical_cols) > 1:
            plt.figure(figsize=figsize)
            correlation_matrix = self.df[numerical_cols].corr()
            
            sns.heatmap(correlation_matrix, 
                       annot=True, 
                       cmap='coolwarm', 
                       center=0,
                       square=True,
                       fmt='.2f')
            
            plt.title('Correlation Matrix of Numerical Variables')
            plt.tight_layout()
            plt.show()
        else:
            print("Not enough numerical columns for correlation analysis")
    
    def distribution_plots(self, columns=None):
        """Create distribution plots for specified columns"""
        if columns is None:
            columns = self.df.select_dtypes(include=[np.number]).columns[:4]
        
        n_cols = len(columns)
        if n_cols == 0:
            print("No numerical columns found")
            return
        
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        axes = axes.ravel()
        
        for i, col in enumerate(columns[:4]):
            if i < len(axes):
                self.df[col].hist(bins=30, ax=axes[i], alpha=0.7)
                axes[i].set_title(f'Distribution of {col}')
                axes[i].set_xlabel(col)
                axes[i].set_ylabel('Frequency')
        
        # Hide empty subplots
        for i in range(len(columns), len(axes)):
            axes[i].set_visible(False)
        
        plt.tight_layout()
        plt.show()
    
    def categorical_analysis(self, column, top_n=10):
        """Analyze categorical column with bar plot"""
        if column not in self.df.columns:
            print(f"Column '{column}' not found in dataset")
            return
        
        value_counts = self.df[column].value_counts().head(top_n)
        
        plt.figure(figsize=(12, 6))
        value_counts.plot(kind='bar')
        plt.title(f'Top {top_n} Values in {column}')
        plt.xlabel(column)
        plt.ylabel('Count')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.show()
        
        return value_counts
    
    def time_series_analysis(self, date_column, value_column):
        """Perform time series analysis if date column exists"""
        if date_column not in self.df.columns or value_column not in self.df.columns:
            print("Required columns not found")
            return
        
        # Convert to datetime
        self.df[date_column] = pd.to_datetime(self.df[date_column])
        
        # Sort by date
        df_sorted = self.df.sort_values(date_column)
        
        plt.figure(figsize=(15, 6))
        plt.plot(df_sorted[date_column], df_sorted[value_column])
        plt.title(f'{value_column} over Time')
        plt.xlabel('Date')
        plt.ylabel(value_column)
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.show()
    
    def export_summary(self, filename='analysis_summary.txt'):
        """Export analysis summary to text file"""
        with open(filename, 'w') as f:
            f.write("Data Analysis Summary\\n")
            f.write("=" * 50 + "\\n\\n")
            f.write(f"Dataset Shape: {self.df.shape}\\n\\n")
            f.write("Column Information:\\n")
            f.write(str(self.df.dtypes) + "\\n\\n")
            f.write("Missing Values:\\n")
            f.write(str(self.df.isnull().sum()) + "\\n\\n")
            f.write("Basic Statistics:\\n")
            f.write(str(self.df.describe()) + "\\n")
        
        print(f"Summary exported to {filename}")

# Example usage
if __name__ == "__main__":
    # analyzer = DataAnalyzer('your_data.csv')
    # analyzer.basic_info()
    # analyzer.correlation_analysis()
    # analyzer.distribution_plots()
    # analyzer.export_summary()
    pass`,
  }

  const filteredRepos =
    activeTab === "all" ? repos : repos.filter((repo) => repo.topics.includes(activeTab.toLowerCase()))

  return (
    <section id="projects" className="py-16 sm:py-20 px-4 md:px-6 lg:px-8 scroll-mt-16">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Featured Projects</h2>
          <div className="h-1 w-20 bg-primary mx-auto"></div>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
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
                <TabsList className="grid w-full max-w-md grid-cols-3 sm:grid-cols-5">
                  <TabsTrigger value="all" className="text-xs sm:text-sm">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="react" className="text-xs sm:text-sm">
                    React
                  </TabsTrigger>
                  <TabsTrigger value="nextjs" className="text-xs sm:text-sm">
                    Next.js
                  </TabsTrigger>
                  <TabsTrigger value="javascript" className="text-xs sm:text-sm">
                    JS
                  </TabsTrigger>
                  <TabsTrigger value="python" className="text-xs sm:text-sm">
                    Python
                  </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRepos.map((repo, index) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-start justify-between text-base sm:text-lg">
                        <span className="line-clamp-2">{repo.name}</span>
                        <Badge variant="outline" className="text-xs ml-2 shrink-0">
                          {repo.language}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow pb-3">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{repo.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4 max-w-full">
                        {repo.topics.slice(0, 3).map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-xs whitespace-nowrap px-2 py-1">
                            {topic}
                          </Badge>
                        ))}
                        {repo.topics.length > 3 && (
                          <Badge variant="secondary" className="text-xs whitespace-nowrap px-2 py-1">
                            +{repo.topics.length - 3}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs bg-transparent"
                        onClick={() => {
                          document.getElementById(`code-${repo.id}`)?.scrollIntoView({ behavior: "smooth" })
                        }}
                      >
                        <Code className="mr-2 h-3 w-3" />
                        View Code
                      </Button>
                    </CardContent>
                    <CardFooter className="flex gap-2 pt-0">
                      <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent" asChild>
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                          <Github className="mr-1 h-3 w-3" />
                          Source
                        </a>
                      </Button>
                      {repo.homepage && (
                        <Button variant="default" size="sm" className="flex-1 text-xs" asChild>
                          <a href={repo.homepage} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-1 h-3 w-3" />
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
              <h3 className="text-xl sm:text-2xl font-bold text-center mb-8">Code Snippets</h3>
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
                  <h4 className="text-lg sm:text-xl font-semibold mb-4">{repo.name}</h4>
                  <CodeSnippet
                    code={codeSnippets[repo.name as keyof typeof codeSnippets] || "// Code snippet not available"}
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
