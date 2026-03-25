import { apiClient } from "./client"
import type {
  Invitation,
  InvitationDetails,
  CreateInvitationPayload,
  AcceptInvitationResult,
} from "@/types"

export const invitationService = {
  // Store-scoped routes (require auth)
  list: (storeId: string, token?: string | null) =>
    apiClient.get<{ data: Invitation[] }>(`/stores/${storeId}/invitations`, token),

  create: (storeId: string, payload: CreateInvitationPayload, token?: string | null) =>
    apiClient.post<Invitation>(`/stores/${storeId}/invitations`, payload, token),

  revoke: (storeId: string, invitationId: string, token?: string | null) =>
    apiClient.delete<void>(`/stores/${storeId}/invitations/${invitationId}`, token),

  resend: (storeId: string, invitationId: string, token?: string | null) =>
    apiClient.post<Invitation>(`/stores/${storeId}/invitations/${invitationId}/resend`, {}, token),

  // Public routes (without /api/v1 prefix)
  getByToken: (inviteToken: string) =>
    apiClient.publicGet<InvitationDetails>(`/api/public/invitations/token/${inviteToken}`),

  // Accept requires auth (uses /api/v1 prefix from apiClient)
  accept: (inviteToken: string, authToken?: string | null) =>
    apiClient.post<AcceptInvitationResult>("/invitations/accept", { token: inviteToken }, authToken),
}
