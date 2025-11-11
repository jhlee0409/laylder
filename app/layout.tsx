import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Laylder - AI Layout Builder",
  description: "Visual layout builder with AI-powered code generation",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
