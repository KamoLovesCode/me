import type { Metadata } from "next"
import Hero from "@/components/hero"
import About from "@/components/about"
import Skills from "@/components/skills"
import Projects from "@/components/projects"
import Experience from "@/components/experience"
import ThemeToggle from "@/components/theme-toggle"
import SectionNavigator from "@/components/section-navigator"
import ScrollProgress from "@/components/scroll-progress"
// import GeminiMicButton from "@/components/GeminiMicButton"

export const metadata: Metadata = {
  title: "Kamogelo Mosia | Full-Stack Developer Portfolio",
  description: "BSc Computer Science graduate from Johannesburg, showcasing web development skills and projects",
}

export default function Home() {
  return (
    <main className="min-h-screen section-snap">
      <ScrollProgress />
      <SectionNavigator />
      <div className="fixed right-2 top-16 sm:top-4 sm:right-4 z-50 flex gap-2">
        <ThemeToggle />
        {/* <GeminiMicButton /> */}
      </div>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Experience />
    </main>
  )
}
