"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { catalogSchema, type CatalogFormData } from "@/schemas/catalog.schema"
import { useCreateCatalog } from "@/hooks/catalog/useCreateCatalog"
import { useUpdateCatalog } from "@/hooks/catalog/useUpdateCatalog"
import type { Catalog } from "@/types/catalog.types"

interface CatalogFormProps {
  // When present the form renames an existing catalog; otherwise it creates one.
  // Only id + name are needed, so both list (Catalog) and detail (CatalogDetail)
  // shapes are accepted.
  catalog?: Pick<Catalog, "id" | "name">
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: (catalog: Catalog) => void
  // Pass `null` to render no trigger (controlled from outside).
  trigger?: React.ReactNode
}

export function CatalogForm({
  catalog,
  open,
  onOpenChange,
  onSuccess,
  trigger,
}: CatalogFormProps) {
  const router = useRouter()
  const isEditing = !!catalog
  const createCatalog = useCreateCatalog()
  const updateCatalog = useUpdateCatalog()

  const form = useForm<CatalogFormData>({
    resolver: zodResolver(catalogSchema),
    defaultValues: { name: catalog?.name ?? "" },
  })

  // Keep the field in sync when the same sheet instance is reused to rename a
  // different catalog.
  useEffect(() => {
    if (open) form.reset({ name: catalog?.name ?? "" })
  }, [open, catalog, form])

  const isPending = createCatalog.isPending || updateCatalog.isPending

  async function onSubmit(data: CatalogFormData) {
    try {
      if (isEditing) {
        const updated = await updateCatalog.mutateAsync({
          id: catalog.id,
          payload: { name: data.name },
        })
        toast.success("Catálogo renomeado")
        onSuccess?.(updated)
      } else {
        const created = await createCatalog.mutateAsync({ name: data.name })
        toast.success("Catálogo criado", {
          description: "Agora escolha os produtos que fazem parte dele.",
        })
        onOpenChange?.(false)
        onSuccess?.(created)
        // New catalogs open straight into product selection.
        router.push(`/catalogs/${created.id}`)
        return
      }
      onOpenChange?.(false)
    } catch (error) {
      toast.error(isEditing ? "Erro ao renomear" : "Erro ao criar catálogo", {
        description:
          error instanceof Error ? error.message : "Tente novamente mais tarde.",
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger !== null && (
        <SheetTrigger asChild>
          {trigger ?? (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo catálogo
            </Button>
          )}
        </SheetTrigger>
      )}
      <SheetContent side="right" className="w-[400px] sm:w-[480px]">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Renomear catálogo" : "Novo catálogo"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Altere o nome deste catálogo."
              : "Dê um nome ao catálogo. Ex.: Catálogo de Páscoa, Catálogo de Natal."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nome <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Catálogo de Páscoa" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="mt-2 flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange?.(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Salvar" : "Criar e escolher produtos"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
