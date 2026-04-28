import type { Metadata } from "next"
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "LiveCart - Venda mais nas suas lives",
  description:
    "Plataforma de vendas ao vivo que detecta pedidos automaticamente nos comentários das suas lives.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
