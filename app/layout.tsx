import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import AnalyticsTracker from "@/components/analytics-tracker"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Kamogelo Mosia | Full-Stack Developer Portfolio",
  description:
    "BSc Computer Science graduate from Johannesburg, showcasing web development skills and projects. Available for junior developer roles and internships.",
  keywords: [
    "Kamogelo Mosia",
    "Full-Stack Developer",
    "Computer Science",
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "Johannesburg",
    "South Africa",
    "Web Developer",
    "Portfolio",
  ],
  authors: [{ name: "Kamogelo Mosia", url: "https://kamocodes.xyz" }],
  creator: "Kamogelo Mosia",
  publisher: "Kamogelo Mosia",
  metadataBase: new URL("https://kamocodes.xyz"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kamocodes.xyz",
    title: "Kamogelo Mosia | Full-Stack Developer Portfolio",
    description: "BSc Computer Science graduate showcasing web development skills and projects",
    siteName: "Kamogelo Mosia Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kamogelo Mosia | Full-Stack Developer Portfolio",
    description: "BSc Computer Science graduate showcasing web development skills and projects",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense>
            <AnalyticsTracker />
            {children}
          </Suspense>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
