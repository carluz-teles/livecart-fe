"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { IdeaDetail } from "@/components/idea/IdeaDetail"
import { useIdea } from "@/hooks/idea"

export default function IdeaDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id

  const { data, isLoading, isError, refetch } = useIdea(id)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Voltar
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-8">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-8 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-32 w-full mt-4" />
          </div>
        </Card>
      ) : isError || !data ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-destructive mb-3">Ideia não encontrada ou inacessível.</p>
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Tentar novamente
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/ideas">Voltar para o canal</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <IdeaDetail idea={data} />
      )}
    </div>
  )
}
