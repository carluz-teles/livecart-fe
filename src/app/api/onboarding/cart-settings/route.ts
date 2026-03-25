import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { userId, getToken } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const token = await getToken()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    // First, get the user's store ID from /users/me
    const userResponse = await fetch(`${apiUrl}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!userResponse.ok) {
      const errorData = await userResponse.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error || "Erro ao buscar usuário" },
        { status: userResponse.status }
      )
    }

    const userData = await userResponse.json()
    const storeId = userData.data?.storeId

    if (!storeId) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Now update cart settings using the store-scoped endpoint
    const response = await fetch(`${apiUrl}/stores/${storeId}/cart-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        enabled: body.enabled,
        expirationMinutes: body.expirationMinutes,
        reserveStock: body.reserveStock,
        maxItems: body.maxItems,
        maxQuantityPerItem: body.maxQuantityPerItem,
        notifyBeforeExpiration: body.notifyBeforeExpiration,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error || "Erro ao salvar configurações" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Cart settings error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
