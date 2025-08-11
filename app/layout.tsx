import type React from "react"
import type { Metadata } from "next"
// Removed GeistSans and GeistMono imports to resolve font loading error
// import { GeistSans } from 'geist/font/sans'
// import { GeistMono } from 'geist/font/mono'
import "./globals.css"

export const metadata: Metadata = {
  title: "Quiz Presentation Website", // Updated title for clarity
  description: "Admin tool for creating and displaying quizzes.", // Updated description
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Removed custom font styling to resolve font loading error */}
        {/* <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style> */}
      </head>
      <body>{children}</body>
    </html>
  )
}
