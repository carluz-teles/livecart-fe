"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import {
  UserPlus,
  MoreHorizontal,
  Mail,
  Shield,
  ShieldCheck,
  UserX,
  Trash2,
  Search,
  Loader2,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useStoreId } from "@/hooks/useUser"
import { memberService } from "@/services/api/member.service"
import { invitationService } from "@/services/api/invitation.service"
import type { Member, Invitation } from "@/types"

const roleLabels = {
  owner: { label: "Proprietario", variant: "default" as const },
  admin: { label: "Administrador", variant: "secondary" as const },
  member: { label: "Membro", variant: "outline" as const },
}

const statusLabels = {
  active: { label: "Ativo", className: "bg-green-500/10 text-green-600" },
  pending: { label: "Pendente", className: "bg-yellow-500/10 text-yellow-600" },
  inactive: { label: "Inativo", className: "bg-gray-500/10 text-gray-600" },
}

function getInitials(name: string | null) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function TeamPage() {
  const { getToken } = useAuth()
  const { storeId, isLoading: isLoadingStore } = useStoreId()
  const [searchQuery, setSearchQuery] = useState("")
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member")

  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInviting, setIsInviting] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [isResending, setIsResending] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!storeId) return

    try {
      setIsLoading(true)
      const token = await getToken()

      const [membersRes, invitationsRes] = await Promise.all([
        memberService.list(storeId, token),
        invitationService.list(storeId, token),
      ])

      setMembers(membersRes.data || [])
      setInvitations(invitationsRes.data || [])
    } catch (error) {
      console.error("Failed to fetch members:", error)
      toast.error("Erro ao carregar membros", {
        description: "Nao foi possivel carregar a lista de membros.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [storeId, getToken])

  useEffect(() => {
    if (storeId) {
      fetchData()
    }
  }, [storeId, fetchData])

  // Filter members by search
  const filteredMembers = members.filter(
    (member) =>
      (member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter pending invitations (not accepted)
  const pendingInvitations = invitations.filter((inv) => inv.status === "pending")

  const handleInvite = async () => {
    if (!storeId || !inviteEmail) return

    setIsInviting(true)
    try {
      const token = await getToken()
      await invitationService.create(storeId, { email: inviteEmail, role: inviteRole }, token)

      toast.success("Convite enviado", {
        description: `Convite enviado para ${inviteEmail}`,
      })

      setIsInviteOpen(false)
      setInviteEmail("")
      setInviteRole("member")
      fetchData()
    } catch (error: unknown) {
      console.error("Failed to invite:", error)
      const apiError = error as { error?: string }
      toast.error("Erro ao enviar convite", {
        description: apiError.error || "Nao foi possivel enviar o convite.",
      })
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemove = async () => {
    if (!storeId || !memberToRemove) return

    setIsRemoving(true)
    try {
      const token = await getToken()
      await memberService.remove(storeId, memberToRemove.id, token)

      toast.success("Membro removido", {
        description: `${memberToRemove.name || memberToRemove.email} foi removido da equipe.`,
      })

      setMemberToRemove(null)
      fetchData()
    } catch (error: unknown) {
      console.error("Failed to remove member:", error)
      const apiError = error as { error?: string }
      toast.error("Erro ao remover membro", {
        description: apiError.error || "Nao foi possivel remover o membro.",
      })
    } finally {
      setIsRemoving(false)
    }
  }

  const handleRoleChange = async (member: Member, newRole: "admin" | "member") => {
    if (!storeId) return

    try {
      const token = await getToken()
      await memberService.updateRole(storeId, member.id, { role: newRole }, token)

      toast.success("Funcao atualizada", {
        description: `${member.name || member.email} agora e ${roleLabels[newRole].label}.`,
      })

      fetchData()
    } catch (error: unknown) {
      console.error("Failed to update role:", error)
      const apiError = error as { error?: string }
      toast.error("Erro ao alterar funcao", {
        description: apiError.error || "Nao foi possivel alterar a funcao.",
      })
    }
  }

  const handleResendInvite = async (invitation: Invitation) => {
    if (!storeId) return

    setIsResending(invitation.id)
    try {
      const token = await getToken()
      await invitationService.resend(storeId, invitation.id, token)

      toast.success("Convite reenviado", {
        description: `Convite reenviado para ${invitation.email}`,
      })
    } catch (error: unknown) {
      console.error("Failed to resend invite:", error)
      const apiError = error as { error?: string }
      toast.error("Erro ao reenviar convite", {
        description: apiError.error || "Nao foi possivel reenviar o convite.",
      })
    } finally {
      setIsResending(null)
    }
  }

  const handleRevokeInvite = async (invitation: Invitation) => {
    if (!storeId) return

    try {
      const token = await getToken()
      await invitationService.revoke(storeId, invitation.id, token)

      toast.success("Convite revogado", {
        description: `Convite para ${invitation.email} foi cancelado.`,
      })

      fetchData()
    } catch (error: unknown) {
      console.error("Failed to revoke invite:", error)
      const apiError = error as { error?: string }
      toast.error("Erro ao revogar convite", {
        description: apiError.error || "Nao foi possivel revogar o convite.",
      })
    }
  }

  if (isLoadingStore || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Membros da equipe</CardTitle>
              <CardDescription>
                Gerencie quem tem acesso a sua loja
              </CardDescription>
            </div>
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Convidar membro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Convidar novo membro</DialogTitle>
                  <DialogDescription>
                    Envie um convite por e-mail para adicionar um novo membro a sua equipe.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Funcao</Label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "member")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma funcao" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Administrador</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="member">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <span>Membro</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Administradores podem gerenciar membros e configuracoes.
                      Membros podem apenas operar a loja.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleInvite} disabled={!inviteEmail || isInviting}>
                    {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enviar convite
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Members Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro</TableHead>
                  <TableHead>Funcao</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <p className="text-sm text-muted-foreground">
                        Nenhum membro encontrado.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatarUrl || undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name || member.email}</p>
                            {member.name && (
                              <p className="text-sm text-muted-foreground">
                                {member.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleLabels[member.role as keyof typeof roleLabels]?.variant || "outline"}>
                          {roleLabels[member.role as keyof typeof roleLabels]?.label || member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusLabels[member.status as keyof typeof statusLabels]?.className || ""}
                        >
                          {statusLabels[member.status as keyof typeof statusLabels]?.label || member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(member.joinedAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {member.role !== "owner" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Acoes</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(member, member.role === "admin" ? "member" : "admin")}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                {member.role === "admin" ? "Tornar Membro" : "Tornar Admin"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setMemberToRemove(member)}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Remover acesso
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Convites pendentes</CardTitle>
            <CardDescription>
              {pendingInvitations.length} convite(s) aguardando aceitacao
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {invitation.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {roleLabels[invitation.role as keyof typeof roleLabels]?.label || invitation.role} -
                        Expira em {new Date(invitation.expiresAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResendInvite(invitation)}
                      disabled={isResending === invitation.id}
                    >
                      {isResending === invitation.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      <span className="ml-2 hidden sm:inline">Reenviar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeInvite(invitation)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Revogar</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover acesso do membro?</AlertDialogTitle>
            <AlertDialogDescription>
              Voce esta prestes a remover o acesso de{" "}
              <span className="font-medium">{memberToRemove?.name || memberToRemove?.email}</span> da sua
              loja. Esta acao pode ser revertida convidando o usuario novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Trash2 className="mr-2 h-4 w-4" />
              Remover acesso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
