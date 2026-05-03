import type { IdeaStatus } from "@/types/idea.types"

export interface IdeaStatusMeta {
  label: string
  badgeClass: string
  description: string
}

// Centralizes status metadata so the badge, dropdown, and notification text
// pull from one source. Tailwind classes use design tokens (no raw hex).
export const IDEA_STATUS_META: Record<IdeaStatus, IdeaStatusMeta> = {
  aberta: {
    label: "Aberta",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    description: "Recém publicada, ainda sem priorização.",
  },
  em_estudo: {
    label: "Em estudo",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    description: "Equipe avaliando viabilidade e impacto.",
  },
  em_desenvolvimento: {
    label: "Em desenvolvimento",
    badgeClass: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
    description: "Já entrou no roadmap e está sendo construída.",
  },
  concluida: {
    label: "Concluída",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    description: "Disponível para uso.",
  },
  recusada: {
    label: "Recusada",
    badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    description: "Avaliada e fora do escopo no momento.",
  },
}

export function getIdeaStatusMeta(status: IdeaStatus | string): IdeaStatusMeta {
  return (
    IDEA_STATUS_META[status as IdeaStatus] ?? {
      label: status,
      badgeClass: "bg-muted text-muted-foreground border-muted-foreground/20",
      description: "",
    }
  )
}

export function formatStatusChange(oldStatus: string, newStatus: string): string {
  const oldLabel = getIdeaStatusMeta(oldStatus).label
  const newLabel = getIdeaStatusMeta(newStatus).label
  return `de ${oldLabel} para ${newLabel}`
}
