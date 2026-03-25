"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Users, ArrowLeft, Plus, X, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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

interface StepTeamProps {
  onFinish: (invites: PendingInvite[]) => void
  onBack: () => void
  onSkip: () => void
  isSubmitting?: boolean
}

export function StepTeam({ onFinish, onBack, onSkip, isSubmitting }: StepTeamProps) {
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
    // Check if email already exists
    if (pendingInvites.some((invite) => invite.email === data.email)) {
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
        <form onSubmit={handleSubmit(addInvite)} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="email" className="sr-only">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                {...register("email")}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
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
            <Button type="submit" size="icon" disabled={isSubmitting}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {pendingInvites.length > 0 && (
          <div className="space-y-2">
            <Label>Convites pendentes</Label>
            <div className="space-y-2">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.email}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{invite.email}</span>
                    <Badge variant="outline" className="text-xs">
                      {invite.role === "admin" ? "Admin" : "Membro"}
                    </Badge>
                  </div>
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
              ))}
            </div>
          </div>
        )}

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
