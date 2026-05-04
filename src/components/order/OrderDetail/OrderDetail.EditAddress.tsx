"use client"

import { use, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useUpdateShippingAddress } from "@/hooks/order"
import type { ShippingAddressPayload } from "@/types/cart.types"
import { OrderDetailContext } from "./OrderDetailContext"

const schema = z.object({
  zipCode: z
    .string()
    .min(8, "CEP precisa de 8 dígitos")
    .max(9, "CEP precisa de 8 dígitos"),
  street: z.string().min(1, "Obrigatório"),
  number: z.string().min(1, "Obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Obrigatório"),
  city: z.string().min(1, "Obrigatório"),
  state: z
    .string()
    .length(2, "Use a sigla com 2 letras (ex.: SP)")
    .transform((v) => v.toUpperCase()),
})

type FormValues = z.infer<typeof schema>

// "Edit address" is intentionally a separate component (not inlined in the
// Shipping card) because it owns mutation state, dialog control, and the
// validation schema — keeping it standalone means the Shipping card stays
// purely presentational.
export function OrderDetailEditAddress() {
  const ctx = use(OrderDetailContext)
  const [open, setOpen] = useState(false)
  const update = useUpdateShippingAddress()

  const order = ctx?.state.order
  // The hook is called unconditionally to satisfy rules-of-hooks; defaults
  // are recomputed when the dialog opens with an order already in context.
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      zipCode: order?.shippingAddress?.zipCode ?? "",
      street: order?.shippingAddress?.street ?? "",
      number: order?.shippingAddress?.number ?? "",
      complement: order?.shippingAddress?.complement ?? "",
      neighborhood: order?.shippingAddress?.neighborhood ?? "",
      city: order?.shippingAddress?.city ?? "",
      state: order?.shippingAddress?.state ?? "",
    },
  })

  if (!ctx || !order) return null

  // Backend rejects the same conditions, but hiding the trigger keeps the
  // UI honest: editing isn't possible after payment or once a shipment row
  // exists (would desync with the carrier / buyer's receipt).
  const canEdit = order.paymentStatus !== "paid" && !order.shipment
  if (!canEdit) return null

  const onSubmit = (values: FormValues) => {
    update.mutate(
      {
        id: order.id,
        address: values as ShippingAddressPayload,
      },
      {
        onSuccess: () => {
          toast.success("Endereço atualizado")
          setOpen(false)
        },
        onError: () => toast.error("Falha ao atualizar endereço"),
      },
    )
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      // Re-prime the form with the latest snapshot when reopening.
      form.reset({
        zipCode: order.shippingAddress?.zipCode ?? "",
        street: order.shippingAddress?.street ?? "",
        number: order.shippingAddress?.number ?? "",
        complement: order.shippingAddress?.complement ?? "",
        neighborhood: order.shippingAddress?.neighborhood ?? "",
        city: order.shippingAddress?.city ?? "",
        state: order.shippingAddress?.state ?? "",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full print:hidden">
          <Pencil className="mr-2 h-3 w-3" />
          Editar endereço
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar endereço de entrega</DialogTitle>
          <DialogDescription>
            Atualize os dados antes que o envio seja criado. Após o despacho,
            este endereço fica congelado para evitar conflito com a transportadora.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    CEP <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="00000-000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-[1fr_120px] gap-3">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Rua <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Número <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="complement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input placeholder="Apto, bloco, referência…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Bairro <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-[1fr_80px] gap-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Cidade <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      UF <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input maxLength={2} className="uppercase" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? "Salvando…" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
