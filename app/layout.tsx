import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "TRADELUX - Vehicle Display",
  description: "Professional vehicle display page for TRADELUX private network",
  keywords: ["TRADELUX", "vehicle", "Mercedes", "S580", "luxury car"],
  authors: [{ name: "TRADELUX" }],
  viewport: "width=device-width, initial-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  )
}
