export interface Invitation {
  id: string
  storeId: string
  email: string
  role: string
  status: string
  expiresAt: string
  createdAt: string
  invitedBy: {
    id: string
    name: string | null
    email: string
  }
}

export interface InvitationDetails {
  id: string
  email: string
  role: string
  status: string
  storeName: string
  expiresAt: string
  invitedBy: {
    name: string | null
    email: string
  }
}

export interface CreateInvitationPayload {
  email: string
  role: "admin" | "member"
}

export interface AcceptInvitationPayload {
  clerkUserId: string
  email: string
  name?: string
  avatarUrl?: string
}

export interface AcceptInvitationResult {
  storeId: string
  storeName: string
  storeSlug: string
  role: string
}
