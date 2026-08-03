"use client"

import { useEffect } from "react"
import { useAuth } from "@clerk/nextjs"

import { setAuthTokenRefresher } from "@/services/api/client"

/**
 * Liga o `getToken` do Clerk ao cliente HTTP.
 *
 * O cliente roda fora do React e recebe o token já pronto, vindo de quem
 * chamou. Quando esse token vence no caminho — tela parada, aba em segundo
 * plano, requisição em fila — o 401 chegava cru na interface como
 * `invalid token: token expired`, e só o F5 resolvia, porque remontar a
 * aplicação pega um token novo.
 *
 * Com a ponte registrada, o cliente renova e repete a requisição sozinho. O
 * `skipCache` é o ponto: sem ele o Clerk devolveria o MESMO token vencido do
 * cache da sessão e a segunda tentativa falharia igual.
 *
 * Não renderiza nada — existe só para o efeito de registro.
 */
export function AuthTokenBridge() {
  const { getToken, isSignedIn } = useAuth()

  useEffect(() => {
    if (!isSignedIn) {
      setAuthTokenRefresher(null)
      return
    }
    setAuthTokenRefresher(() => getToken({ skipCache: true }))
    return () => setAuthTokenRefresher(null)
  }, [getToken, isSignedIn])

  return null
}
