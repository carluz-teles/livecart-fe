import type { Metadata } from "next"
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google"
import { CrispChat } from "@/components/shared/CrispChat"
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
  metadataBase: new URL("https://livecart.com.br"),
  title: "LiveCart - Venda mais nas suas lives",
  description:
    "Plataforma de vendas ao vivo que detecta pedidos automaticamente nos comentários das suas lives.",
  icons: {
    icon: [
      { url: "/livecart/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/livecart/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/livecart/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/livecart/favicon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/livecart/favicon/favicon.ico",
    apple: { url: "/livecart/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
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
        <CrispChat />
      </body>
    </html>
  )
}
