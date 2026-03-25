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

    // Use store-scoped endpoint if storeId is provided (during onboarding)
    // This avoids relying on JWT org context which may not be available immediately
    const endpoint = body.storeId
      ? `${apiUrl}/stores/${body.storeId}/cart-settings`
      : `${apiUrl}/stores/me/cart-settings`

    const response = await fetch(endpoint, {
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
