import { Check } from "lucide-react"

interface FaqItemProps {
  question: string
  answer: React.ReactNode
}

// Static Q/A block — a real accordion would add interaction cost without
// helping; the doc page is short enough to scan all answers at once.
export function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="flex items-start gap-2 text-sm font-medium">
        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
        {question}
      </p>
      <div className="mt-2 pl-6 text-sm leading-relaxed text-muted-foreground">
        {answer}
      </div>
    </div>
  )
}
