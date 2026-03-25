import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

interface InvitePayload {
  email: string
  role: "admin" | "member"
}

export async function POST(request: NextRequest) {
  const { userId, getToken } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const invites = body.invites as InvitePayload[]

    if (!Array.isArray(invites) || invites.length === 0) {
      return NextResponse.json({ error: "Nenhum convite para enviar" }, { status: 400 })
    }

    const token = await getToken()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    // Get current store to get the store ID
    const storeResponse = await fetch(`${apiUrl}/stores/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!storeResponse.ok) {
      const errorData = await storeResponse.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error || "Erro ao buscar loja" },
        { status: storeResponse.status }
      )
    }

    const storeData = await storeResponse.json()
    const storeId = storeData.data?.id

    if (!storeId) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Send each invite
    const results = await Promise.allSettled(
      invites.map(async (invite) => {
        const response = await fetch(`${apiUrl}/stores/${storeId}/invitations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: invite.email,
            role: invite.role,
          }),
        })

        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          throw new Error(error.error || `Erro ao enviar convite para ${invite.email}`)
        }

        return response.json()
      })
    )

    const successful = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length

    if (failed > 0 && successful === 0) {
      return NextResponse.json(
        { error: "Erro ao enviar convites" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sent: successful,
      failed: failed,
    })
  } catch (error) {
    console.error("Invites error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
