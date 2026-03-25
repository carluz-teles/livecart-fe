export interface Member {
  id: string
  userId: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: string
  status: string
  joinedAt: string
  invitedAt: string | null
}

export interface UpdateMemberRolePayload {
  role: "admin" | "member"
}

export type MemberRole = "owner" | "admin" | "member"
