"use client"

import type { ComponentType, SVGProps } from "react"

// Compact 32×20 brand chips (8:5 aspect) sized to sit comfortably next to a
// label or an input. Keep these inline SVG rather than asset-import to avoid
// network/CSP friction on the public checkout subdomain. Brand colors are
// sampled from each network's published guidelines.

export function MastercardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 20" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="20" rx="3" fill="#1F2937" />
      <circle cx="13" cy="10" r="5.2" fill="#EB001B" />
      <circle cx="19" cy="10" r="5.2" fill="#F79E1B" />
      <path
        d="M16 5.7a5.2 5.2 0 0 0 0 8.6 5.2 5.2 0 0 0 0-8.6Z"
        fill="#FF5F00"
      />
    </svg>
  )
}

export function VisaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 20" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="20" rx="3" fill="#1A1F71" />
      <text
        x="16"
        y="13.6"
        fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
        fontSize="7.5"
        fontWeight="800"
        textAnchor="middle"
        fill="#FFFFFF"
        letterSpacing="0.4"
      >
        VISA
      </text>
    </svg>
  )
}

export function AmexIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 20" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="20" rx="3" fill="#2671C5" />
      <text
        x="16"
        y="13.6"
        fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
        fontSize="7"
        fontWeight="800"
        textAnchor="middle"
        fill="#FFFFFF"
        letterSpacing="0.5"
      >
        AMEX
      </text>
    </svg>
  )
}

export function EloIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 20" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="20" rx="3" fill="#000000" />
      {/* Simplified elo emblem: three small dots in brand colors */}
      <circle cx="9.5" cy="10" r="1.6" fill="#FFCB05" />
      <circle cx="13" cy="10" r="1.6" fill="#00A4E0" />
      <circle cx="16.5" cy="10" r="1.6" fill="#EF4123" />
      <text
        x="22.5"
        y="13"
        fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
        fontSize="6.5"
        fontWeight="700"
        textAnchor="middle"
        fill="#FFFFFF"
        letterSpacing="0"
      >
        elo
      </text>
    </svg>
  )
}

export function HipercardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 20" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="20" rx="3" fill="#B5121B" />
      <text
        x="16"
        y="13.5"
        fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
        fontSize="6.5"
        fontWeight="800"
        fontStyle="italic"
        textAnchor="middle"
        fill="#FFFFFF"
        letterSpacing="0"
      >
        Hiper
      </text>
    </svg>
  )
}

export function GenericCardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 20" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="19"
        rx="2.5"
        fill="#F8FAFC"
        stroke="#E2E8F0"
      />
      <rect x="3" y="6" width="6" height="3" rx="0.5" fill="#CBD5E1" />
      <rect x="3" y="12" width="14" height="2" rx="0.5" fill="#E2E8F0" />
    </svg>
  )
}

// Mercado Pago uses these `id` values in payment_method.id. Mapping is
// authoritative for the brands we care about; anything else falls back to the
// generic chip in the UI.
export const BRAND_ICON_MAP: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  master: MastercardIcon,
  visa: VisaIcon,
  amex: AmexIcon,
  elo: EloIcon,
  hipercard: HipercardIcon,
}

// Order matters — this is the row rendered in the form header. The most
// commonly used brands sit on the left so the eye reads them first.
export const ACCEPTED_BRANDS: Array<{
  id: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}> = [
  { id: "visa", Icon: VisaIcon },
  { id: "master", Icon: MastercardIcon },
  { id: "elo", Icon: EloIcon },
  { id: "amex", Icon: AmexIcon },
  { id: "hipercard", Icon: HipercardIcon },
]
