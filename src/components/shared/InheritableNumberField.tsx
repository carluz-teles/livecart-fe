"use client"

import { Input } from "@/components/ui/input"

interface InheritableNumberFieldProps {
  /** null = herda a configuração da loja. */
  value: number | null | undefined
  onChange: (value: number | null) => void
  /** Piso aceito pelo banco. Abaixo disso o save falha. */
  min: number
  /** Teto, quando existe de verdade. Omitir quando não há limite. */
  max?: number
  /** Valor da loja, mostrado como placeholder quando o campo herda. */
  inheritedValue?: number | null
  /** Sufixo da unidade: "minutos", "unidades". */
  unit?: string
  disabled?: boolean
  id?: string
}

/**
 * Campo numérico livre para as configurações de campanha.
 *
 * Estes campos eram `<Select>` com uma lista fixa (15/30/60/120/1440 minutos,
 * 1/3/5/10 unidades). A lista era invenção da tela: no banco só existe piso —
 * `cart_expiration_minutes >= 15` e `waitlist_notified_ttl_minutes` entre 5 e
 * 240 — e `cart_max_quantity_per_item` **não tem CHECK nenhum**, aceita
 * qualquer inteiro. O lojista que quisesse 45 minutos ou 7 unidades não tinha
 * como pedir.
 *
 * Vazio significa "herda da loja" (null), que é o mesmo que a opção "inherit"
 * do select significava — só que agora sem ocupar uma linha na lista.
 */
export function InheritableNumberField({
  value,
  onChange,
  min,
  max,
  inheritedValue,
  unit,
  disabled,
  id,
}: InheritableNumberFieldProps) {
  const placeholder =
    inheritedValue != null ? `Padrão da loja: ${inheritedValue}` : "Padrão da loja"

  return (
    <div className="flex items-center gap-2">
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        disabled={disabled}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value
          // Campo vazio volta a herdar em vez de virar 0 — que passaria na
          // validação de tipo e seria recusado pelo CHECK como 500.
          onChange(raw === "" ? null : Number(raw))
        }}
        className="max-w-[220px]"
      />
      {unit ? <span className="text-sm text-muted-foreground">{unit}</span> : null}
    </div>
  )
}
