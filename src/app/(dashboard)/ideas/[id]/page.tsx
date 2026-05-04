import { auth } from "@clerk/nextjs/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { IdeaDetailPageClient } from "@/components/idea/IdeaDetailPage.Client"
import { ideaKeys } from "@/hooks/idea"
import { getQueryClient } from "@/lib/get-query-client"
import { ideaService } from "@/services/api/idea.service"

interface IdeaDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  const { id } = await params

  const queryClient = getQueryClient()
  const { getToken } = await auth()
  const token = await getToken()

  // allSettled keeps a 404/401 from 500-ing the page; the client
  // useIdea() falls into its own error state when the prefetch failed.
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ideaKeys.detail(id),
      queryFn: () => ideaService.getById(id, token),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IdeaDetailPageClient ideaId={id} />
    </HydrationBoundary>
  )
}
