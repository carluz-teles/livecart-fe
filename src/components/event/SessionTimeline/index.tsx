"use client"

import { useState } from "react"
import { Radio, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ActiveSessionCard } from "./SessionTimeline.ActiveCard"
import { SessionDot } from "./SessionTimeline.Dot"
import { CommentsModal } from "./SessionTimeline.CommentsModal"
import type { EventSession } from "@/types/event.types"

interface SessionTimelineProps {
  sessions: EventSession[]
  eventId: string
  isLoading?: boolean
  onNewSession?: () => void
}

function SessionTimeline({
  sessions,
  eventId,
  isLoading,
  onNewSession,
}: SessionTimelineProps) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<EventSession | null>(null)
  const [selectedSessionNumber, setSelectedSessionNumber] = useState<number>(0)

  // Find active session (first active/live session)
  const activeSession = sessions.find(s => s.status === "active" || s.status === "live")
  const activeSessionIndex = activeSession ? sessions.indexOf(activeSession) + 1 : 0

  // Ended sessions for the timeline
  const endedSessions = sessions.filter(s => s.status !== "active" && s.status !== "live")

  const handleShowComments = (session: EventSession, index: number) => {
    setSelectedSession(session)
    setSelectedSessionNumber(index)
    setCommentsOpen(true)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24 mt-1" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  // No sessions at all
  if (!sessions || sessions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Radio className="h-4 w-4" />
                Sessoes
              </CardTitle>
              <CardDescription>Nenhuma sessao registrada</CardDescription>
            </div>
            {onNewSession && (
              <Button variant="outline" size="sm" onClick={onNewSession}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Nova Sessao
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-6 text-center">
            <Radio className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              Inicie uma sessao de transmissao para comecar a receber pedidos
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Radio className="h-4 w-4" />
                Sessoes
              </CardTitle>
              <CardDescription>
                {sessions.length} sessao(oes) • {activeSession ? "1 ao vivo" : "nenhuma ativa"}
              </CardDescription>
            </div>
            {onNewSession && (
              <Button variant="outline" size="sm" onClick={onNewSession}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Nova
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active session card */}
          {activeSession && (
            <ActiveSessionCard
              session={activeSession}
              eventId={eventId}
              sessionNumber={activeSessionIndex}
              onShowComments={() => handleShowComments(activeSession, activeSessionIndex)}
            />
          )}

          {/* Timeline for all sessions */}
          {sessions.length > 0 && (
            <div className="pt-2">
              {/* Only show timeline header if there are ended sessions */}
              {endedSessions.length > 0 && activeSession && (
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  Historico
                </p>
              )}

              {/* Horizontal timeline */}
              <div className="flex items-start gap-0 overflow-x-auto pb-2">
                {sessions.map((session, index) => (
                  <div key={session.id} className="flex items-center">
                    <SessionDot
                      session={session}
                      sessionNumber={index + 1}
                      isLast={index === sessions.length - 1}
                      onClick={() => handleShowComments(session, index + 1)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments modal */}
      {selectedSession && (
        <CommentsModal
          open={commentsOpen}
          onOpenChange={setCommentsOpen}
          sessionNumber={selectedSessionNumber}
          comments={selectedSession.comments || []}
          totalComments={selectedSession.totalComments}
        />
      )}
    </>
  )
}

// Export as compound component
SessionTimeline.ActiveCard = ActiveSessionCard
SessionTimeline.Dot = SessionDot
SessionTimeline.CommentsModal = CommentsModal

export { SessionTimeline }
