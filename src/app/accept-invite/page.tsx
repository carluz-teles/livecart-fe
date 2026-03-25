'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSignIn, useSignUp, useOrganization } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

type PageState = 'loading' | 'signing_in' | 'sign_up_form' | 'success' | 'error'

export default function AcceptInvitePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const ticket = searchParams.get('__clerk_ticket')
  const status = searchParams.get('__clerk_status') // 'sign_in' or 'sign_up'

  const { signIn, setActive: setActiveSignIn } = useSignIn()
  const { signUp, setActive: setActiveSignUp } = useSignUp()
  const { organization } = useOrganization()

  const [pageState, setPageState] = useState<PageState>('loading')
  const [error, setError] = useState<string | null>(null)

  // Sign up form fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Case 1: User already has Clerk account -> Auto sign in
  useEffect(() => {
    if (!signIn || !ticket || status !== 'sign_in' || organization) return

    setPageState('signing_in')

    const handleSignIn = async () => {
      try {
        const result = await signIn.create({
          strategy: 'ticket',
          ticket: ticket,
        })

        if (result.status === 'complete') {
          await setActiveSignIn({ session: result.createdSessionId })
          setPageState('success')
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/')
          }, 2000)
        }
      } catch (err) {
        console.error('Sign-in error:', err)
        setError('Erro ao processar o convite. O link pode ter expirado.')
        setPageState('error')
      }
    }

    handleSignIn()
  }, [signIn, ticket, status, organization, setActiveSignIn, router])

  // Case 2: User needs to sign up
  useEffect(() => {
    if (!ticket || status !== 'sign_up') return
    setPageState('sign_up_form')
  }, [ticket, status])

  // Handle sign up form submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signUp || !ticket) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await signUp.create({
        strategy: 'ticket',
        ticket: ticket,
        firstName,
        lastName,
        password,
      })

      if (result.status === 'complete') {
        await setActiveSignUp({ session: result.createdSessionId })
        setPageState('success')
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    } catch (err: unknown) {
      console.error('Sign-up error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // No ticket - invalid invite
  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <CardTitle>Convite Inválido</CardTitle>
            <CardDescription>
              O link do convite é inválido ou expirou.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push('/sign-in')}>
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading state
  if (pageState === 'loading' || pageState === 'signing_in') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
            <CardTitle>Processando Convite</CardTitle>
            <CardDescription>
              {pageState === 'signing_in'
                ? 'Entrando na sua conta...'
                : 'Aguarde enquanto verificamos seu convite...'}
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
              Você foi adicionado à organização com sucesso.
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
            <CardTitle>Erro ao Aceitar Convite</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push('/sign-in')}>
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Sign up form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Criar sua Conta</CardTitle>
          <CardDescription>
            Você foi convidado para uma loja no LiveCart.
            Preencha seus dados para aceitar o convite.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  placeholder="João"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  placeholder="Silva"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo de 8 caracteres
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta e Entrar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
