export interface Invitation {
  id: string
  email: string
  role: string
  status: string
  inviterName: string | null
  expiresAt: string
  acceptedAt?: string | null
  createdAt: string
}

export interface InvitationDetails {
  id: string
  email: string
  role: string
  status: string
  storeName: string
  storeSlug: string
  inviterName: string | null
  expiresAt: string
  createdAt: string
}

export interface CreateInvitationPayload {
  email: string
  role: "admin" | "member"
}

export interface AcceptInvitationPayload {
  token: string
}

export interface AcceptInvitationResult {
  storeId: string
  storeName: string
  storeSlug: string
  role: string
}
