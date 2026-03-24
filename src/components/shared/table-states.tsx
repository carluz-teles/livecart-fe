import { TableCell, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface TableLoadingRowsProps {
  columns: number
  rows?: number
  widths?: string[]
}

export function TableLoadingRows({ columns, rows = 5, widths }: TableLoadingRowsProps) {
  const defaultWidths = Array.from({ length: columns }, (_, i) =>
    i === 0 ? "w-32" : "w-20"
  )
  const columnWidths = widths || defaultWidths

  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton className={`h-4 ${columnWidths[colIndex] || "w-20"}`} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

interface TableErrorStateProps {
  columns: number
  message?: string
}

export function TableErrorState({ columns, message = "Erro ao carregar dados. Tente novamente." }: TableErrorStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={columns} className="h-24 text-center text-destructive">
        {message}
      </TableCell>
    </TableRow>
  )
}

interface TableEmptyStateProps {
  columns: number
  message?: string
}

export function TableEmptyState({ columns, message = "Nenhum item encontrado." }: TableEmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={columns} className="h-24 text-center text-muted-foreground">
        {message}
      </TableCell>
    </TableRow>
  )
}
