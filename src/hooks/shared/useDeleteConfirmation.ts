"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

interface DeleteConfirmationOptions<T> {
  onDelete: (item: T) => Promise<void>
  successMessage?: string
  errorMessage?: string
  getItemName?: (item: T) => string
}

export function useDeleteConfirmation<T extends { id: string }>({
  onDelete,
  successMessage = "Item excluído com sucesso!",
  errorMessage = "Erro ao excluir item",
  getItemName,
}: DeleteConfirmationOptions<T>) {
  const [itemToDelete, setItemToDelete] = useState<T | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const requestDelete = useCallback((item: T) => {
    setItemToDelete(item)
  }, [])

  const cancelDelete = useCallback(() => {
    setItemToDelete(null)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return

    setIsDeleting(true)
    try {
      await onDelete(itemToDelete)
      const name = getItemName ? getItemName(itemToDelete) : itemToDelete.id
      toast.success(successMessage, {
        description: `"${name}" foi excluído.`,
      })
      setItemToDelete(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tente novamente mais tarde."
      toast.error(errorMessage, { description: message })
    } finally {
      setIsDeleting(false)
    }
  }, [itemToDelete, onDelete, successMessage, errorMessage, getItemName])

  return {
    itemToDelete,
    isDeleting,
    isOpen: itemToDelete !== null,
    requestDelete,
    cancelDelete,
    confirmDelete,
  }
}
