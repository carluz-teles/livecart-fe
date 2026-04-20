interface OnboardingChecklistProgressProps {
  percentage: number
  completedCount: number
  totalCount: number
}

export function OnboardingChecklistProgress({
  percentage,
  completedCount,
  totalCount,
}: OnboardingChecklistProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">Configure sua loja</span>
        <span className="text-muted-foreground">
          {completedCount}/{totalCount}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {percentage === 100
          ? "Parabéns! Você completou todas as etapas."
          : `${percentage}% concluído`}
      </p>
    </div>
  )
}
