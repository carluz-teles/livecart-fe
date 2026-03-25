"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Users, ArrowLeft, Plus, X, Check, Crown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { teamInviteSchema, type TeamInviteData } from "@/schemas/onboarding.schema"

interface PendingInvite {
  email: string
  role: "admin" | "member"
}

interface CurrentUser {
  email: string
  name: string | null
  avatarUrl: string | null
}

interface StepTeamProps {
  currentUser: CurrentUser
  onFinish: (invites: PendingInvite[]) => void
  onBack: () => void
  onSkip: () => void
  isSubmitting?: boolean
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  return email[0].toUpperCase()
}

export function StepTeam({ currentUser, onFinish, onBack, onSkip, isSubmitting }: StepTeamProps) {
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TeamInviteData>({
    resolver: zodResolver(teamInviteSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  })

  const role = watch("role")

  const addInvite = (data: TeamInviteData) => {
    // Check if email already exists or is the current user
    if (
      pendingInvites.some((invite) => invite.email === data.email) ||
      data.email === currentUser.email
    ) {
      return
    }
    setPendingInvites([...pendingInvites, data])
    reset()
  }

  const removeInvite = (email: string) => {
    setPendingInvites(pendingInvites.filter((invite) => invite.email !== email))
  }

  const handleFinish = () => {
    onFinish(pendingInvites)
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Convide sua Equipe</CardTitle>
        <CardDescription>
          Adicione membros para ajudar a gerenciar sua loja
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team Members List */}
        <div className="space-y-2">
          <Label>Membros da equipe</Label>
          <div className="space-y-2">
            {/* Current User - Owner */}
            <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(currentUser.name, currentUser.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {currentUser.name || currentUser.email}
                  </span>
                  {currentUser.name && (
                    <span className="text-xs text-muted-foreground">
                      {currentUser.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs gap-1">
                  <Crown className="h-3 w-3" />
                  Proprietario
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Voce
                </Badge>
              </div>
            </div>

            {/* Pending Invites */}
            {pendingInvites.map((invite) => (
              <div
                key={invite.email}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {invite.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{invite.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {invite.role === "admin" ? "Admin" : "Membro"}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeInvite(invite.email)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Invite Form */}
        <form onSubmit={handleSubmit(addInvite)} className="space-y-2">
          <Label htmlFor="email">Adicionar membro</Label>
          <div className="flex items-center gap-2">
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              className="flex-1"
              {...register("email")}
              disabled={isSubmitting}
            />
            <Select
              value={role}
              onValueChange={(value: "admin" | "member") => setValue("role", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Membro</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" size="icon" className="shrink-0" disabled={isSubmitting}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </form>

        <div className="rounded-lg border border-dashed p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Você pode convidar mais pessoas depois em{" "}
            <span className="font-medium">Configurações &gt; Equipe</span>
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button type="button" variant="ghost" onClick={onSkip} disabled={isSubmitting}>
          Pular
        </Button>
        <Button onClick={handleFinish} className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Finalizando..." : "Finalizar"}
          <Check className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
