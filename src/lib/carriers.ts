// Local fallback logos for carriers that don't come with one from the
// shipping provider. Files live in public/carriers/<slug>.<ext>. Missing
// entries fall through to the generic Truck icon in the UI.
const LOCAL_CARRIER_LOGOS: Record<string, string> = {
  azul: "/carriers/azul.png",
  carriers: "/carriers/carriers.png",
  correios: "/carriers/correios.png",
  // SmartEnvios returns Correios services (PAC / Sedex) under `carrier`,
  // so alias them to the Correios logo.
  pac: "/carriers/correios.png",
  sedex: "/carriers/correios.png",
  dba: "/carriers/dba.jpg",
  gollog: "/carriers/gollog.png",
  hdl: "/carriers/hdl.jpg",
  jadlog: "/carriers/jadlog.png",
  jamef: "/carriers/jamef.png",
  leofran: "/carriers/leofran.png",
  loggi: "/carriers/loggi.png",
  movimente: "/carriers/movimente.png",
  redesul: "/carriers/redesul.png",
  "total-express": "/carriers/total-express.png",
  "trans-wells": "/carriers/trans-wells.png",
}

// Lowercase, strip accents, collapse non-alphanumerics into hyphens, trim.
// Example: "Total Express" → "total-express", "J&T" → "j-t".
export function slugifyCarrier(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Pick the best available logo for a carrier. Provider-supplied URLs win
// (they're always current); the local map is a fallback for providers that
// don't ship logos at all (e.g. some SmartEnvios services).
export function resolveCarrierLogo(
  carrier: string,
  providerLogoUrl?: string | null
): string | null {
  if (providerLogoUrl && providerLogoUrl.trim().length > 0) {
    return providerLogoUrl
  }
  const slug = slugifyCarrier(carrier)
  return LOCAL_CARRIER_LOGOS[slug] ?? null
}
