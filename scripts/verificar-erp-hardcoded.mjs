#!/usr/bin/env node
/**
 * A catraca do nome do ERP no texto que o lojista lê.
 *
 * O LiveCart integra dois ERPs. Toda frase que crava "Tiny" mente para uma loja
 * de Bling — e mentiu, em produção de staging, em três telas que o lojista
 * encontrou na mão:
 *
 *   "O pedido existe no Tiny…"           (banner de falha no ERP)
 *   "O Tiny enviou 3 imagens…"           (busca de produto — era Bling)
 *   "…não entra no pedido do Tiny"       (item sem vínculo)
 *
 * Nenhum deles tinha gate de provider. Em staging, onde o único ERP é o Bling,
 * 100% das renderizações mentiam.
 *
 * ═══ O QUE ELA VARRE, E O QUE ELA DEIXA PASSAR ═══
 *
 * Varre TEXTO VISÍVEL: conteúdo de nó JSX e strings de props que viram texto na
 * tela (title, description, label, placeholder, aria-label).
 *
 * NÃO varre comentário — proibir "Tiny" em comentário só faz apagarem a
 * documentação que explica por que o Tiny é diferente.
 *
 * NÃO varre nome de componente (TinyLogo), chave de mapa, import nem href: são
 * identificadores, não frases.
 *
 * A allowlist é por CAMINHO e cada entrada tem o motivo escrito. Arquivo novo é
 * NEGADO por padrão — quem quiser a exceção escreve a linha e o porquê.
 *
 * Uso:  node scripts/verificar-erp-hardcoded.mjs
 */

import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const RAIZ = "src"

/** Onde citar o Tiny pelo nome é a resposta CERTA. */
const PERMITIDOS = [
  // O guia de conexão do Tiny é sobre o Tiny.
  { prefixo: "src/app/(dashboard)/docs/integrations/tiny/", porque: "guia do Tiny" },
  // Módulos que só existem para o Tiny e são gateados por provider.id === "tiny".
  { prefixo: "src/components/integration/TinyHealthCheck/", porque: "módulo do Tiny, gateado" },
  { prefixo: "src/components/integration/Drenagem/", porque: "drenagem do modelo legado do Tiny" },
  { prefixo: "src/components/integration/ERPReserva/", porque: "módulo de Reserva do Tiny, gateado" },
  // Catálogo de vitrine e mapas de rótulo: "Tiny ERP" é o nome do produto.
  { prefixo: "src/app/(dashboard)/settings/integrations/page.tsx", porque: "catálogo por provider" },
  { prefixo: "src/types/integration.types.ts", porque: "catálogo de providers" },
  { prefixo: "src/hooks/integration/useERPConectado.ts", porque: "é a FONTE do nome certo" },
  { prefixo: "src/hooks/integration/useConnectTiny.ts", porque: "conexão do Tiny" },
  { prefixo: "src/components/product/ProductDetailModal/", porque: "mapa de rótulo por fonte" },
  { prefixo: "src/app/privacy/", porque: "cita os dois ERPs" },
  { prefixo: "src/app/(dashboard)/support/", porque: "link para o guia do Tiny" },
  { prefixo: "src/app/(dashboard)/docs/page.tsx", porque: "link para o guia do Tiny" },
  { prefixo: "src/components/docs/", porque: "material do guia" },
]

/** Props cujo valor vira texto na tela. */
const PROPS_VISIVEIS = /\b(title|description|label|placeholder|aria-label|alt|subtitle|hint|emptyMessage)\s*=\s*["'`]([^"'`]*)["'`]/g

function arquivos(dir, saida = []) {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome)
    if (statSync(caminho).isDirectory()) {
      arquivos(caminho, saida)
    } else if (/\.(tsx|ts)$/.test(nome)) {
      saida.push(caminho)
    }
  }
  return saida
}

function permitido(caminho) {
  const rel = relative(".", caminho).replaceAll("\\", "/")
  return PERMITIDOS.find((p) => rel.startsWith(p.prefixo))
}

/** Tira comentários de linha e de bloco, para a catraca ler só o que renderiza. */
function semComentarios(fonte) {
  return fonte
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((l) => (l.trim().startsWith("//") ? "" : l.replace(/\s\/\/.*$/, "")))
    .join("\n")
}

const achados = []

for (const caminho of arquivos(RAIZ)) {
  if (permitido(caminho)) continue
  const bruto = readFileSync(caminho, "utf8")
  if (!/Tiny/.test(bruto)) continue

  const limpo = semComentarios(bruto)

  limpo.split("\n").forEach((linha, i) => {
    // Identificadores não são frases.
    const semIdentificadores = linha
      .replace(/\bTinyLogo\b|\bTinyHealthCheck\w*|\buseConnectTiny\b|\bERPReserva\b/g, "")
      .replace(/["'`][^"'`]*\/tiny[^"'`]*["'`]/g, "") // hrefs
      .replace(/^\s*import .*$/, "")

    // 1) texto entre tags JSX
    const emTexto = />[^<>{}]*\bTiny\b/.test(semIdentificadores)
    // 2) prop visível com Tiny no valor
    let emProp = false
    for (const m of semIdentificadores.matchAll(PROPS_VISIVEIS)) {
      if (/\bTiny\b/.test(m[2])) emProp = true
    }
    // 3) string solta com espaço em volta — frase, não chave de mapa
    const emFrase = /["'`][^"'`]*\s\bTiny\b|\bTiny\b\s[^"'`]*["'`]/.test(semIdentificadores)

    // Citar os DOIS não mente: é frase de catálogo ("conecte seu ERP (Tiny ou
    // Bling)"), e não uma afirmação sobre qual ERP a loja usa.
    const citaOsDois = /\bBling\b/.test(linha)

    if (!citaOsDois && (emTexto || emProp || emFrase)) {
      achados.push({ caminho, linha: i + 1, trecho: linha.trim().slice(0, 110) })
    }
  })
}

if (achados.length === 0) {
  console.log("✓ nenhum nome de ERP cravado em texto visível")
  process.exit(0)
}

console.error(
  `\n✗ ${achados.length} texto(s) visível(is) cravam "Tiny" — numa loja Bling isso MENTE.\n` +
    `  Use o hook useERPConectado (fallback "seu ERP") ou receba o nome por prop.\n` +
    `  Se o texto for mesmo do Tiny, acrescente o caminho a PERMITIDOS COM O MOTIVO.\n`,
)
for (const a of achados) {
  console.error(`  ${a.caminho}:${a.linha}\n      ${a.trecho}`)
}
process.exit(1)
