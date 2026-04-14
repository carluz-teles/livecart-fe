"use client"

import { useState, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { User, Mail, Camera, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const profileSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

function getInitials(name: string | null | undefined) {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function AccountPage() {
  const { user, isLoaded } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  })

  // Reset form when entering edit mode
  const handleStartEditing = () => {
    form.reset({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    form.reset({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    })
    setIsEditing(false)
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return

    setIsSaving(true)
    try {
      await user.update({
        firstName: data.firstName,
        lastName: data.lastName || "",
      })

      toast.success("Perfil atualizado", {
        description: "Suas informações foram salvas com sucesso.",
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Erro ao salvar", {
        description: "Não foi possível atualizar seu perfil. Tente novamente.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Arquivo inválido", {
        description: "Por favor, selecione uma imagem (JPG, PNG ou GIF).",
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Arquivo muito grande", {
        description: "A imagem deve ter no máximo 2MB.",
      })
      return
    }

    setIsUploadingPhoto(true)
    try {
      await user.setProfileImage({ file })
      toast.success("Foto atualizada", {
        description: "Sua foto de perfil foi alterada com sucesso.",
      })
    } catch (error) {
      console.error("Failed to upload photo:", error)
      toast.error("Erro ao enviar foto", {
        description: "Não foi possível atualizar sua foto. Tente novamente.",
      })
    } finally {
      setIsUploadingPhoto(false)
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    setIsDeleting(true)
    try {
      await user.delete()
      // User will be redirected automatically by Clerk
    } catch (error) {
      console.error("Failed to delete account:", error)
      toast.error("Erro ao excluir conta", {
        description: "Não foi possível excluir sua conta. Tente novamente.",
      })
      setIsDeleting(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-9 w-32" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>
            Suas informações pessoais e foto de perfil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.imageUrl} alt={user?.fullName || "Avatar"} />
              <AvatarFallback className="text-lg">
                {getInitials(user?.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handlePhotoClick}
                disabled={isUploadingPhoto}
              >
                {isUploadingPhoto ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="mr-2 h-4 w-4" />
                )}
                {isUploadingPhoto ? "Enviando..." : "Alterar foto"}
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, GIF ou PNG. Máximo 2MB.
              </p>
            </div>
          </div>

          <Separator />

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            {...field}
                            disabled={!isEditing || isSaving}
                            className="pl-9"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sobrenome</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            {...field}
                            disabled={!isEditing || isSaving}
                            className="pl-9"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    value={user?.primaryEmailAddress?.emailAddress || ""}
                    disabled
                    className="pl-9 bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  O e-mail não pode ser alterado por aqui.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Salvar alterações
                    </Button>
                  </>
                ) : (
                  <Button type="button" variant="outline" onClick={handleStartEditing}>
                    Editar perfil
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da conta</CardTitle>
          <CardDescription>
            Detalhes sobre sua conta e autenticação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">ID do usuário</dt>
              <dd className="text-sm font-mono">{user?.id}</dd>
            </div>
            <Separator />
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Conta criada em</dt>
              <dd className="text-sm">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </dd>
            </div>
            <Separator />
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Último acesso</dt>
              <dd className="text-sm">
                {user?.lastSignInAt
                  ? new Date(user.lastSignInAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de perigo</CardTitle>
          <CardDescription>
            Ações irreversíveis para sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Excluir conta</p>
              <p className="text-sm text-muted-foreground">
                Exclua permanentemente sua conta e todos os dados associados
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Excluir conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso irá excluir permanentemente sua
                    conta e remover seus dados de nossos servidores.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sim, excluir minha conta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
