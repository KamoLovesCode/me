import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import AnalyticsTracker from "@/components/analytics-tracker"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import ScrollToTop from "@/components/scroll-to-top"
import ChatSheet from "@/components/chat/ChatSheet"

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
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://kamocodes.xyz" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/logo/artificial-intelligence.png" sizes="any" />
        <link rel="icon" type="image/png" href="/logo/artificial-intelligence.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo/artificial-intelligence.png" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense>
            <AnalyticsTracker />
            <ScrollToTop />
            <ChatSheet />
            {children}
          </Suspense>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
