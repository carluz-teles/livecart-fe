"use client"

import { forwardRef, useState } from "react"
import type { useForm } from "react-hook-form"
import { ChevronDown, Truck } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  CreateProductFormData,
  UpdateProductFormData,
} from "@/schemas/product.schema"

interface ProductFormShippingFieldsProps {
  form: ReturnType<typeof useForm<CreateProductFormData | UpdateProductFormData>>
}

const packageFormatOptions = [
  { value: "box", label: "Caixa" },
  { value: "roll", label: "Rolo / tubo" },
  { value: "letter", label: "Envelope" },
]

export function ProductFormShippingFields({
  form,
}: ProductFormShippingFieldsProps) {
  const shipping = form.watch("shipping")
  const hasAnyDimension =
    shipping?.weightGrams !== null ||
    shipping?.heightCm !== null ||
    shipping?.widthCm !== null ||
    shipping?.lengthCm !== null ||
    (shipping?.sku ?? "") !== "" ||
    shipping?.insuranceValueCents !== null

  const [open, setOpen] = useState(hasAnyDimension)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
        >
          <div className="flex items-center gap-2.5">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium leading-tight">
                Dados para frete
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Preencha para habilitar cotação automática no checkout
              </p>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="border-t px-4 pb-4 pt-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <IntegerField
              control={form.control}
              name="shipping.weightGrams"
              label="Peso (g)"
              placeholder="150"
            />
            <IntegerField
              control={form.control}
              name="shipping.heightCm"
              label="Altura (cm)"
              placeholder="10"
            />
            <IntegerField
              control={form.control}
              name="shipping.widthCm"
              label="Largura (cm)"
              placeholder="20"
            />
            <IntegerField
              control={form.control}
              name="shipping.lengthCm"
              label="Comprimento (cm)"
              placeholder="30"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Preencha os quatro campos ou deixe todos em branco. Use o peso e as
            medidas do produto <em>embalado</em>.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="shipping.sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="CAM-PT-M-001"
                      maxLength={100}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shipping.packageFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Embalagem</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {packageFormatOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="shipping.insuranceValueCents"
            render={({ field }) => (
              <InsuranceField
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            )}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// =============================================================================
// INTEGER FIELD (for weight/dimensions)
// =============================================================================

interface IntegerFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any
  name: string
  label: string
  placeholder: string
}

function IntegerField({ control, name, label, placeholder }: IntegerFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              placeholder={placeholder}
              value={field.value ?? ""}
              onChange={(e) => {
                const raw = e.target.value
                if (raw === "") {
                  field.onChange(null)
                  return
                }
                const n = parseInt(raw, 10)
                field.onChange(Number.isNaN(n) ? null : n)
              }}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// =============================================================================
// INSURANCE FIELD (currency, nullable)
// =============================================================================

interface InsuranceFieldProps {
  value: number | null
  onChange: (cents: number | null) => void
  onBlur: () => void
  name: string
}

const InsuranceField = forwardRef<HTMLInputElement, InsuranceFieldProps>(
  function InsuranceField({ value, onChange, onBlur, name }, ref) {
    const [displayValue, setDisplayValue] = useState(() =>
      value && value > 0 ? (value / 100).toFixed(2).replace(".", ",") : ""
    )

    const [prevValue, setPrevValue] = useState(value)
    if (value !== prevValue) {
      setPrevValue(value)
      setDisplayValue(
        value && value > 0 ? (value / 100).toFixed(2).replace(".", ",") : ""
      )
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value.replace(/[^\d,]/g, "")
      const parts = raw.split(",")
      const sanitized =
        parts.length > 2 ? parts[0] + "," + parts.slice(1).join("") : raw
      const [integer, decimal] = sanitized.split(",")
      const limited =
        decimal !== undefined ? integer + "," + decimal.slice(0, 2) : sanitized

      setDisplayValue(limited)

      if (limited === "") {
        onChange(null)
        return
      }
      const normalized = limited.replace(",", ".")
      const cents = Math.round(parseFloat(normalized || "0") * 100)
      onChange(Number.isNaN(cents) ? null : cents)
    }

    function handleBlur() {
      if (displayValue) {
        const normalized = displayValue.replace(",", ".")
        const num = parseFloat(normalized)
        if (!Number.isNaN(num) && num > 0) {
          setDisplayValue(num.toFixed(2).replace(".", ","))
        } else {
          setDisplayValue("")
          onChange(null)
        }
      }
      onBlur()
    }

    return (
      <FormItem>
        <FormLabel>Valor declarado para seguro</FormLabel>
        <FormControl>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              R$
            </span>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="Deixe em branco para usar o preço"
              className="pl-10"
              value={displayValue}
              onChange={handleChange}
              onBlur={handleBlur}
              name={name}
              ref={ref}
            />
          </div>
        </FormControl>
        <FormDescription>
          Valor informado à transportadora para o seguro do FRETE (cobre extravio/dano). Impacta o preço da cotação: quanto maior o valor, mais caro o frete. Se vazio, usamos o preço do produto.
        </FormDescription>
        <FormMessage />
      </FormItem>
    )
  }
)
