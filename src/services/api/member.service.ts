import { apiClient } from "./client"
import type { Member, UpdateMemberRolePayload } from "@/types"

export const memberService = {
  list: (storeId: string, token?: string | null) =>
    apiClient.get<{ data: Member[] }>(`/stores/${storeId}/members`, token),

  updateRole: (storeId: string, memberId: string, payload: UpdateMemberRolePayload, token?: string | null) =>
    apiClient.patch<Member>(`/stores/${storeId}/members/${memberId}/role`, payload, token),

  remove: (storeId: string, memberId: string, token?: string | null) =>
    apiClient.delete<void>(`/stores/${storeId}/members/${memberId}`, token),
}
