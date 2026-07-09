"use client"

import Image from "next/image"

// Casca visual do fluxo de convite — espelho do onboarding: gradiente âmbar
// suave, brilho da marca e logo no topo, com o conteúdo centralizado.
export function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-amber-50/80 via-background to-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-300/25 via-orange-300/20 to-amber-300/25 blur-3xl"
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-6 px-4 py-10">
        <Image
          src="/livecart/logotipo-header.png"
          alt="LiveCart"
          width={140}
          height={36}
          className="h-8 w-auto"
          priority
        />
        {children}
      </div>
    </div>
  )
}
