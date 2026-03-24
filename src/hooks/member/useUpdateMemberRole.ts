"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { memberService } from "@/services/api/member.service"
import { useStoreId } from "@/hooks/useUser"
import { memberKeys } from "./useMembers"
import type { Member, UpdateMemberRolePayload } from "@/types"

interface UpdateMemberRoleParams {
  memberId: string
  payload: UpdateMemberRolePayload
}

export function useUpdateMemberRole() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ memberId, payload }: UpdateMemberRoleParams): Promise<Member> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return memberService.updateRole(storeId, memberId, payload, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() })
    },
  })
}
