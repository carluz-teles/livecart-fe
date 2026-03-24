import { apiClient } from "./client"
import type {
  Invitation,
  InvitationDetails,
  CreateInvitationPayload,
  AcceptInvitationPayload,
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

  // Public routes (auth required but not store-scoped)
  getByToken: (inviteToken: string, token?: string | null) =>
    apiClient.get<InvitationDetails>(`/invitations/${inviteToken}`, token),

  accept: (inviteToken: string, payload: AcceptInvitationPayload, token?: string | null) =>
    apiClient.post<AcceptInvitationResult>(`/invitations/${inviteToken}/accept`, payload, token),
}
