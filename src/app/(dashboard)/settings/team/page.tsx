"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import {
  UserPlus,
  Mail,
  Shield,
  ShieldCheck,
  Crown,
  UserX,
  Trash2,
  Search,
  Loader2,
  RefreshCw,
  Users,
  Clock,
  CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStoreId } from "@/hooks/useUser"
import { memberService } from "@/services/api/member.service"
import { invitationService } from "@/services/api/invitation.service"
import type { Member, Invitation } from "@/types"

const roleConfig = {
  owner: {
    label: "Proprietário",
    icon: Crown,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  admin: {
    label: "Administrador",
    icon: ShieldCheck,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  member: {
    label: "Membro",
    icon: Shield,
    className: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  },
}

const statusConfig = {
  active: {
    label: "Ativo",
    icon: CheckCircle2,
    className: "text-green-600",
  },
  pending: {
    label: "Pendente",
    icon: Clock,
    className: "text-yellow-600",
  },
  inactive: {
    label: "Inativo",
    icon: UserX,
    className: "text-gray-400",
  },
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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
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
        description: "Não foi possível carregar a lista de membros.",
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

  const filteredMembers = members.filter(
    (member) =>
      (member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingInvitations = invitations.filter((inv) => inv.status === "pending")
  const activeMembers = members.filter((m) => m.status === "active")

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
        description: apiError.error || "Não foi possível enviar o convite.",
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
        description: apiError.error || "Não foi possível remover o membro.",
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

      toast.success("Função atualizada", {
        description: `${member.name || member.email} agora é ${roleConfig[newRole].label}.`,
      })

      fetchData()
    } catch (error: unknown) {
      console.error("Failed to update role:", error)
      const apiError = error as { error?: string }
      toast.error("Erro ao alterar função", {
        description: apiError.error || "Não foi possível alterar a função.",
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
        description: apiError.error || "Não foi possível reenviar o convite.",
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
        description: apiError.error || "Não foi possível revogar o convite.",
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Equipe</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie quem tem acesso à sua loja e suas permissões
          </p>
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
                Envie um convite por e-mail para adicionar um novo membro à sua equipe.
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
                <Label htmlFor="role">Função</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "member")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma função" />
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
                  Administradores podem gerenciar membros e configurações.
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

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{members.length}</p>
              <p className="text-sm text-muted-foreground">Total de membros</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{activeMembers.length}</p>
              <p className="text-sm text-muted-foreground">Membros ativos</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{pendingInvitations.length}</p>
              <p className="text-sm text-muted-foreground">Convites pendentes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou e-mail..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Members Grid */}
      <div>
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">
          Membros ({filteredMembers.length})
        </h2>
        {filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12">
            <Users className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              {searchQuery ? "Nenhum membro encontrado" : "Nenhum membro na equipe"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredMembers.map((member) => {
              const role = roleConfig[member.role as keyof typeof roleConfig] || roleConfig.member
              const status = statusConfig[member.status as keyof typeof statusConfig] || statusConfig.inactive
              const RoleIcon = role.icon
              const StatusIcon = status.icon

              return (
                <div
                  key={member.id}
                  className="relative rounded-xl border bg-card p-5 transition-all hover:shadow-md"
                >
                  {/* Owner crown indicator */}
                  {member.role === "owner" && (
                    <div className="absolute -right-1 -top-1">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-sm">
                        <Crown className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Header with avatar and info */}
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 shrink-0 border-2 border-background shadow-sm">
                      <AvatarImage src={member.avatarUrl || undefined} />
                      <AvatarFallback className="bg-muted text-sm font-medium">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{member.name || member.email}</p>
                      {member.name && (
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Role and status badges */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={role.className}>
                      <RoleIcon className="mr-1 h-3 w-3" />
                      {role.label}
                    </Badge>
                    <div className={`flex items-center gap-1 text-xs ${status.className}`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    Membro desde {formatDate(member.joinedAt)}
                  </p>

                  {/* Actions - only for non-owners */}
                  {member.role !== "owner" && (
                    <div className="mt-4 flex items-center gap-2 border-t pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleRoleChange(member, member.role === "admin" ? "member" : "admin")}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        {member.role === "admin" ? "Tornar Membro" : "Tornar Admin"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setMemberToRemove(member)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remover</span>
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">
            Convites pendentes ({pendingInvitations.length})
          </h2>
          <div className="space-y-3">
            {pendingInvitations.map((invitation) => {
              const role = roleConfig[invitation.role as keyof typeof roleConfig] || roleConfig.member
              const RoleIcon = role.icon

              return (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0 border-2 border-dashed border-muted-foreground/30">
                      <AvatarFallback className="bg-muted/50 text-sm text-muted-foreground">
                        {invitation.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="break-all font-medium">{invitation.email}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className={role.className}>
                          <RoleIcon className="mr-1 h-3 w-3" />
                          {role.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Expira em {formatDate(invitation.expiresAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResendInvite(invitation)}
                      disabled={isResending === invitation.id}
                    >
                      {isResending === invitation.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Reenviar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleRevokeInvite(invitation)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Revogar</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover acesso do membro?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a remover o acesso de{" "}
              <span className="font-medium">{memberToRemove?.name || memberToRemove?.email}</span> da sua
              loja. Esta ação pode ser revertida convidando o usuário novamente.
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
