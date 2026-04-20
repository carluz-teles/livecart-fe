'use client'

import { Suspense, useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth, SignIn } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { invitationService } from '@/services/api/invitation.service'
import { userService } from '@/services/api/user.service'
import { InvitationDetails } from '@/types/invitation.types'

import { User } from '@/types'
import { AlertTriangle } from 'lucide-react'
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

type PageState = 'loading' | 'show_login' | 'confirm_leave' | 'accepting' | 'success' | 'error'

function AcceptInviteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const { isSignedIn, isLoaded, getToken } = useAuth()

  const [pageState, setPageState] = useState<PageState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const acceptingRef = useRef(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  // Proceed with accepting the invitation
  const proceedWithAcceptance = useCallback(async (authToken: string | null) => {
    acceptingRef.current = true
    setPageState('accepting')
    setError(null)

    try {
      await invitationService.accept(token!, authToken)
      setPageState('success')
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (err) {
      console.error('Error accepting invitation:', err)
      const errorObj = err as { status?: number; error?: string }
      if (errorObj.status === 403) {
        setError('O email do convite não corresponde à sua conta')
      } else if (errorObj.status === 409) {
        setError('Você é o dono de uma loja. Para aceitar este convite, primeiro exclua sua loja atual.')
      } else if (errorObj.status === 410) {
        setError('O convite expirou ou já foi utilizado')
      } else {
        setError('Erro ao aceitar convite. Tente novamente.')
      }
      setPageState('error')
      acceptingRef.current = false
    }
  }, [token, router])

  // Fetch invitation details when page loads
  useEffect(() => {
    if (!token) {
      setError('Token de convite inválido')
      setPageState('error')
      return
    }

    const fetchInvitation = async () => {
      try {
        const data = await invitationService.getByToken(token)
        setInvitation(data)
        setPageState('show_login')
      } catch (err) {
        console.error('Error fetching invitation:', err)
        const errorObj = err as { status?: number; error?: string }
        if (errorObj.status === 404) {
          setError('Convite não encontrado')
        } else if (errorObj.status === 410) {
          setError('O convite expirou ou já foi utilizado')
        } else {
          setError('Erro ao carregar detalhes do convite')
        }
        setPageState('error')
      }
    }

    fetchInvitation()
  }, [token])

  // Check user status when signed in
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !token || !invitation || acceptingRef.current) {
      return
    }

    const checkAndAccept = async () => {
      try {
        const authToken = await getToken()
        // Sync user first to check if they already have a store
        const user = await userService.sync(authToken)
        setCurrentUser(user)

        // If user has an existing store, show confirmation
        if (user.membership) {
          // If user is owner of their store, they can't accept invites
          if (user.membership.role === 'owner') {
            setError('Você é o dono de uma loja. Para aceitar este convite, primeiro exclua sua loja atual.')
            setPageState('error')
            return
          }
          // Show confirmation dialog for members
          setShowLeaveConfirm(true)
          setPageState('confirm_leave')
        } else {
          // No existing store, proceed with acceptance
          await proceedWithAcceptance(authToken)
        }
      } catch (err) {
        console.error('Error checking user status:', err)
        setError('Erro ao verificar status do usuário')
        setPageState('error')
      }
    }

    checkAndAccept()
  }, [isLoaded, isSignedIn, token, invitation, getToken, proceedWithAcceptance])

  // Handle confirmation to leave current store
  const handleConfirmLeave = async () => {
    setShowLeaveConfirm(false)
    const authToken = await getToken()
    await proceedWithAcceptance(authToken)
  }

  const handleCancelLeave = () => {
    setShowLeaveConfirm(false)
    router.push('/')
  }

  // No token - invalid invite
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <CardTitle>Convite Inválido</CardTitle>
            <CardDescription>
              O link do convite é inválido. Verifique se você copiou o link completo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push('/login')}>
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading state
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
            <CardTitle>Carregando Convite</CardTitle>
            <CardDescription>
              Aguarde enquanto verificamos seu convite...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Confirm leave current store state
  if (pageState === 'confirm_leave') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <CardTitle>Trocar de Loja</CardTitle>
            <CardDescription className="space-y-2">
              <p>
                Você atualmente faz parte da loja <strong>{currentUser?.membership?.storeName}</strong>.
              </p>
              <p>
                Ao aceitar este convite, você será removido da sua loja atual e passará a fazer parte de <strong>{invitation?.storeName}</strong>.
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" onClick={handleConfirmLeave}>
              Confirmar e Trocar de Loja
            </Button>
            <Button variant="outline" className="w-full" onClick={handleCancelLeave}>
              Cancelar
            </Button>
          </CardContent>
        </Card>

        <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Ao continuar, você será removido da loja <strong>{currentUser?.membership?.storeName}</strong> e
                passará a fazer parte de <strong>{invitation?.storeName}</strong>. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelLeave}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmLeave}>
                Confirmar Troca
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // Accepting state
  if (pageState === 'accepting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
            <CardTitle>Aceitando Convite</CardTitle>
            <CardDescription>
              Aguarde enquanto processamos seu aceite...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Success state
  if (pageState === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <CardTitle>Convite Aceito!</CardTitle>
            <CardDescription>
              Você foi adicionado à loja com sucesso.
              Redirecionando para o dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Error state
  if (pageState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <CardTitle>Erro ao Processar Convite</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" onClick={() => router.push('/login')}>
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show login with store name - this is the main state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Custom header with store name */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Entrar para continuar em {invitation?.storeName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Você foi convidado como{' '}
            <span className="font-medium">
              {invitation?.role === 'admin' ? 'Administrador' : 'Membro'}
            </span>
            {invitation?.inviterName && (
              <> por {invitation.inviterName}</>
            )}
          </p>
        </div>

        {/* Clerk SignIn component */}
        <div className="flex justify-center">
          <SignIn
            routing="hash"
            signUpUrl={`/register?redirect_url=/accept-invite?token=${token}`}
            forceRedirectUrl={`/accept-invite?token=${token}`}
            appearance={{
              elements: {
                headerTitle: { display: 'none' },
                headerSubtitle: { display: 'none' },
                card: {
                  boxShadow: 'none',
                  border: '1px solid hsl(var(--border))',
                },
                footer: { display: 'none' },
              },
            }}
          />
        </div>

        {/* Link to create account */}
        <div className="text-center text-sm text-muted-foreground">
          Não tem uma conta?{' '}
          <a
            href={`/register?redirect_url=/accept-invite?token=${token}`}
            className="font-medium text-primary hover:underline"
          >
            Criar conta
          </a>
        </div>
      </div>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-md">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          </div>
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  )
}
