import type { Metadata } from "next"
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { ptBR } from "@clerk/localizations"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { UserProvider } from "@/components/providers/user-provider"
import { Toaster } from "@/components/ui/sonner"
import { clerkAppearance } from "@/lib/clerk-theme"
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
    <ClerkProvider localization={ptBR} appearance={clerkAppearance}>
      <html lang="pt-BR" suppressHydrationWarning>
        <body
          className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} font-sans antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <UserProvider>{children}</UserProvider>
              <Toaster richColors closeButton />
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
