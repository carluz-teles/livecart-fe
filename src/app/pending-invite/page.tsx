"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Store, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { InviteShell } from "@/components/shared/InviteShell"
import { usePendingInvite } from "@/hooks/invitation"
import { useUser } from "@/hooks/useUser"

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  member: "Membro",
}

export default function PendingInvitePage() {
  const { user, isLoading: isLoadingUser } = useUser()
  const { invitations, isAccepting, error, accept, createOwnStore } = usePendingInvite()
  const router = useRouter()

  // Quem já tem loja não tem o que decidir aqui. Acontece ao voltar pela
  // navegação do browser depois de aceitar.
  const alreadyResolved = !isLoadingUser && user?.state === "ready"

  useEffect(() => {
    if (alreadyResolved) {
      router.replace("/dashboard")
    }
  }, [alreadyResolved, router])

  if (isLoadingUser || alreadyResolved) {
    return (
      <InviteShell>
        <Card className="w-full shadow-lg shadow-amber-100/60 duration-300 animate-in fade-in slide-in-from-bottom-2">
          <CardHeader className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
            <CardTitle>Carregando</CardTitle>
            <CardDescription>Verificando seus convites...</CardDescription>
          </CardHeader>
        </Card>
      </InviteShell>
    )
  }

  // O convite pode ter sido revogado ou expirado entre o redirect e este
  // render. Sem loja e sem convite, o caminho é o onboarding.
  if (invitations.length === 0) {
    return (
      <InviteShell>
        <Card className="w-full shadow-lg shadow-amber-100/60 duration-300 animate-in fade-in slide-in-from-bottom-2">
          <CardHeader className="text-center">
            <Store className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <CardTitle>Nenhum convite pendente</CardTitle>
            <CardDescription>
              O convite pode ter expirado ou sido cancelado. Você pode criar sua própria
              loja para começar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={createOwnStore}>
              Criar minha própria loja
            </Button>
          </CardContent>
        </Card>
      </InviteShell>
    )
  }

  const hasMany = invitations.length > 1

  return (
    <InviteShell>
      <Card className="w-full shadow-lg shadow-amber-100/60 duration-300 animate-in fade-in slide-in-from-bottom-2">
        <CardHeader className="text-center">
          <UserPlus className="mx-auto mb-4 h-12 w-12 text-primary" />
          <CardTitle>
            {hasMany ? "Você tem convites pendentes" : "Você tem um convite pendente"}
          </CardTitle>
          <CardDescription>
            {hasMany
              ? "Escolha uma equipe para entrar ou crie sua própria loja."
              : "Entre na equipe que te convidou ou crie sua própria loja."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {invitations.map((invitation) => (
              <li
                key={invitation.id}
                className="rounded-lg border bg-card p-4 text-left"
              >
                <p className="text-sm font-medium">{invitation.storeName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Convidou <span className="font-medium">{invitation.email}</span> como{" "}
                  <span className="font-medium">
                    {ROLE_LABELS[invitation.role] ?? invitation.role}
                  </span>
                  {invitation.inviterName ? <> — por {invitation.inviterName}</> : null}
                </p>
                <Button
                  className="mt-3 w-full"
                  disabled={isAccepting}
                  onClick={() => accept(invitation.token)}
                >
                  {isAccepting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Aceitar convite e entrar"
                  )}
                </Button>
              </li>
            ))}
          </ul>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="space-y-2 border-t pt-4">
            <p className="text-center text-sm text-muted-foreground">
              Não era isso que você queria?
            </p>
            <Button
              variant="outline"
              className="w-full"
              disabled={isAccepting}
              onClick={createOwnStore}
            >
              Criar minha própria loja
            </Button>
          </div>
        </CardContent>
      </Card>
    </InviteShell>
  )
}
