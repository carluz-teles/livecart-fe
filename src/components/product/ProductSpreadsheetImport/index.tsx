"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/shared/PageHeader"
import { getApiErrorMessage } from "@/lib/api-errors"
import { formatCurrency } from "@/lib/format"
import {
  errorCSV,
  IMPORT_FIELDS,
  mapSpreadsheet,
  suggestHeader,
  suggestMapping,
} from "@/lib/product-import/mapping"
import type {
  ColumnMapping,
  ImportRequest,
  ImportResponse,
  SpreadsheetSheet,
} from "@/types/product-import.types"

interface Props {
  backHref: string
  onPreview: (request: ImportRequest) => Promise<ImportResponse>
  onApply: (request: ImportRequest) => Promise<ImportResponse>
}
const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
function download(content: string, filename: string) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/csv;charset=utf-8" })
  )
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function ProductSpreadsheetImport({
  backHref,
  onPreview,
  onApply,
}: Props) {
  const [sheets, setSheets] = useState<SpreadsheetSheet[]>([])
  const [sheetIndex, setSheetIndex] = useState(0)
  const [header, setHeader] = useState(0)
  const [mapping, setMapping] = useState<ColumnMapping>({})
  const [matchBy, setMatchBy] = useState<ImportRequest["matchBy"]>("keyword")
  const [decimal, setDecimal] = useState<"," | ".">(",")
  const [delimiter, setDelimiter] = useState("")
  const [encoding, setEncoding] = useState("utf-8")
  const [filename, setFilename] = useState("")
  const [busy, setBusy] = useState<"read" | "preview" | "apply" | null>(null)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState<ImportResponse | null>(null)
  const [request, setRequest] = useState<ImportRequest | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [page, setPage] = useState(0)
  const worker = useRef<Worker | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inFlight = useRef(false)
  const generation = useRef(0)
  const previewRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (preview && !preview.applied) previewRef.current?.focus()
  }, [preview])
  const sheet = sheets[sheetIndex]
  const mapped = sheet
    ? mapSpreadsheet(sheet, header, mapping, decimal)
    : { rows: [], errors: [] }
  const allErrors = [
    ...mapped.errors,
    ...(preview?.rows.flatMap((row) =>
      row.errors.map((message) => ({ row: row.row, message }))
    ) ?? []),
  ]

  function stopWorker() {
    worker.current?.terminate()
    worker.current = null
    if (timer.current) clearTimeout(timer.current)
  }
  useEffect(
    () => () => {
      generation.current++
      worker.current?.terminate()
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )
  useEffect(() => {
    if (!busy && (!sheets.length || preview?.applied)) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [busy, sheets.length, preview?.applied])
  function clearPreview() {
    setPreview(null)
    setRequest(null)
    setConfirmed(false)
    setPage(0)
    setError("")
  }
  function selectSheet(next: SpreadsheetSheet[], index: number) {
    const start = suggestHeader(next[index]),
      suggested = suggestMapping(next[index].rows[start] ?? [])
    setSheetIndex(index)
    setHeader(start)
    setMapping(suggested)
    setMatchBy(
      suggested.keyword !== undefined || suggested.sku === undefined
        ? "keyword"
        : "sku"
    )
    clearPreview()
  }
  async function readFile(file: File) {
    stopWorker()
    const current = ++generation.current
    setSheets([])
    clearPreview()
    setFilename(file.name)
    if (file.size > 5 * 1024 * 1024) {
      setError("O arquivo deve ter no máximo 5 MB.")
      return
    }
    setBusy("read")
    try {
      const buffer = await file.arrayBuffer()
      if (current !== generation.current) return
      worker.current = new Worker(
        new URL("../../../lib/product-import/worker.ts", import.meta.url)
      )
      const fail = (message: string) => {
        stopWorker()
        setBusy(null)
        setError(message)
      }
      timer.current = setTimeout(
        () =>
          fail(
            "A leitura demorou demais. Divida o arquivo ou salve uma cópia sem formatação e tente novamente."
          ),
        20_000
      )
      worker.current.onerror = () =>
        fail(
          "Não foi possível carregar o leitor. Recarregue a página e tente novamente."
        )
      worker.current.onmessage = (
        event: MessageEvent<{ sheets?: SpreadsheetSheet[]; error?: string }>
      ) => {
        if (current !== generation.current) return
        stopWorker()
        setBusy(null)
        if (event.data.error || !event.data.sheets?.length)
          setError(event.data.error || "Arquivo vazio.")
        else {
          setSheets(event.data.sheets)
          selectSheet(event.data.sheets, 0)
        }
      }
      worker.current.postMessage(
        { buffer, name: file.name, delimiter, encoding },
        [buffer]
      )
    } catch {
      if (current === generation.current) {
        stopWorker()
        setBusy(null)
        setError(
          "Não foi possível abrir o arquivo. Confira o formato e a codificação."
        )
      }
    }
  }
  async function review() {
    if (inFlight.current) return
    inFlight.current = true
    setBusy("preview")
    clearPreview()
    const payload: ImportRequest = { matchBy, rows: mapped.rows }
    try {
      const result = await onPreview(payload)
      setPreview(result)
      setRequest({ ...payload, revision: result.revision })
    } catch (cause) {
      setError(
        getApiErrorMessage(cause, "Não foi possível conferir os produtos.")
      )
    } finally {
      setBusy(null)
      inFlight.current = false
    }
  }
  async function apply() {
    if (!request || !confirmed || inFlight.current || preview?.applied) return
    inFlight.current = true
    setBusy("apply")
    setError("")
    try {
      setPreview(await onApply(request))
      setPage(0)
    } catch (cause) {
      setError(
        getApiErrorMessage(cause, "Não foi possível confirmar a importação.") +
          " Confira o catálogo e gere uma nova prévia antes de tentar novamente."
      )
      setRequest(null)
      setConfirmed(false)
    } finally {
      setBusy(null)
      inFlight.current = false
    }
  }

  if (preview?.applied)
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-4">
        <Card>
          <CardContent className="space-y-5 p-8 text-center">
            <CheckCircle2
              className="mx-auto h-12 w-12 text-primary"
              aria-hidden
            />
            <h1 className="text-2xl font-semibold">Catálogo atualizado</h1>
            <p>
              {preview.created} produtos criados e {preview.updated}{" "}
              atualizados.
            </p>
            <p className="text-sm text-muted-foreground">
              Os campos ausentes foram preservados. Você já pode usar os códigos
              dos produtos nas suas vendas.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href={backHref}>Ver produtos</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSheets([])
                  setFilename("")
                  clearPreview()
                }}
              >
                Importar outra planilha
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-12">
      <Button variant="ghost" size="sm" asChild>
        <Link href={backHref}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar aos produtos
        </Link>
      </Button>
      <PageHeader
        title="Importar produtos"
        description="Traga seu catálogo, confira os dados e atualize tudo de uma vez."
      >
        <Button
          variant="outline"
          onClick={() =>
            download(
              "\ufeffSKU;Nome;Preço;Estoque;Código de barras;Ativo\r\nEXEMPLO-001;Produto de exemplo;19,90;10;7890000000000;Sim\r\n",
              "modelo-produtos.csv"
            )
          }
        >
          <Download className="mr-2 h-4 w-4" />
          Baixar modelo CSV
        </Button>
      </PageHeader>
      <ol
        className="grid grid-cols-3 gap-2 text-sm"
        aria-label="Etapas da importação"
      >
        {["Escolher arquivo", "Relacionar colunas", "Conferir e importar"].map(
          (label, i) => (
            <li
              key={label}
              aria-current={
                i === (preview ? 2 : sheet ? 1 : 0) ? "step" : undefined
              }
              className="border-b-2 py-3 text-muted-foreground aria-[current=step]:border-primary aria-[current=step]:font-semibold aria-[current=step]:text-foreground"
            >
              <span className="mr-2">{i + 1}.</span>
              {label}
            </li>
          )
        )}
      </ol>
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm"
        >
          {error}
        </div>
      )}
      <fieldset
        disabled={!!busy}
        className="min-w-0 space-y-6 disabled:opacity-80"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileSpreadsheet className="h-5 w-5" />
              Sua planilha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-dashed bg-muted/30 p-5">
              <Label htmlFor="spreadsheet-file">
                Selecione um arquivo Excel ou CSV
              </Label>
              <Input
                id="spreadsheet-file"
                className="mt-3 max-w-lg"
                type="file"
                accept=".xlsx,.xls,.csv"
                onClick={(event) => {
                  event.currentTarget.value = ""
                }}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void readFile(file)
                }}
              />
              <p className="mt-3 text-sm text-muted-foreground">
                .xlsx, .xls ou .csv · Até 5 MB e 500 produtos por importação.{" "}
                {filename && (
                  <strong className="break-all font-medium text-foreground">
                    Arquivo: {filename}
                  </strong>
                )}
              </p>
            </div>
            <details className="text-sm">
              <summary className="cursor-pointer font-medium">
                Opções para arquivos CSV
              </summary>
              <p className="my-3 text-muted-foreground">
                Se os acentos ou colunas estiverem incorretos, ajuste estas
                opções e selecione o arquivo novamente.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="csv-delimiter">Separador de colunas</Label>
                  <select
                    id="csv-delimiter"
                    className={selectClass}
                    value={delimiter}
                    onChange={(event) => setDelimiter(event.target.value)}
                  >
                    <option value="">Detectar automaticamente</option>
                    <option value=";">Ponto e vírgula (;)</option>
                    <option value=",">Vírgula (,)</option>
                    <option value={"\t"}>Tabulação</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="csv-encoding">Codificação do texto</Label>
                  <select
                    id="csv-encoding"
                    className={selectClass}
                    value={encoding}
                    onChange={(event) => setEncoding(event.target.value)}
                  >
                    <option value="utf-8">UTF-8</option>
                    <option value="windows-1252">Windows / Excel antigo</option>
                  </select>
                </div>
              </div>
            </details>
          </CardContent>
        </Card>
        {sheet && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Como sua planilha está organizada?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label htmlFor="import-sheet">Aba</Label>
                  <select
                    id="import-sheet"
                    className={selectClass}
                    value={sheetIndex}
                    onChange={(event) =>
                      selectSheet(sheets, Number(event.target.value))
                    }
                  >
                    {sheets.map((s, i) => (
                      <option key={s.name} value={i}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="import-header">Linha do cabeçalho</Label>
                  <Input
                    id="import-header"
                    type="number"
                    min={1}
                    max={Math.min(20, sheet.rows.length)}
                    value={header + 1}
                    onChange={(event) => {
                      const n = Math.max(
                        0,
                        Math.min(
                          19,
                          sheet.rows.length - 1,
                          Number(event.target.value) - 1
                        )
                      )
                      setHeader(n)
                      setMapping(suggestMapping(sheet.rows[n] ?? []))
                      clearPreview()
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="import-decimal">
                    Formato dos valores em texto
                  </Label>
                  <select
                    id="import-decimal"
                    className={selectClass}
                    value={decimal}
                    onChange={(event) => {
                      setDecimal(event.target.value as "," | ".")
                      clearPreview()
                    }}
                  >
                    <option value=",">1.234,56 (brasileiro)</option>
                    <option value=".">1,234.56 (internacional)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="import-match">Identificar produtos por</Label>
                  <select
                    id="import-match"
                    className={selectClass}
                    value={matchBy}
                    onChange={(event) => {
                      setMatchBy(event.target.value as ImportRequest["matchBy"])
                      clearPreview()
                    }}
                  >
                    <option value="sku">SKU / código do fornecedor</option>
                    <option value="keyword">Código LiveCart</option>
                  </select>
                </div>
              </div>
              <div className="rounded-md bg-muted/50 p-4 text-sm leading-relaxed">
                Produtos com o mesmo{" "}
                {matchBy === "sku" ? "SKU" : "código LiveCart"} serão
                atualizados automaticamente. Células vazias e campos não
                relacionados serão preservados. Para novos produtos, informe
                nome e preço; preço zero é permitido. Código LiveCart é o número
                de quatro dígitos que a cliente comenta; SKU é o código do
                fornecedor. O estoque é a quantidade disponível para venda.
                Produtos integrados mantêm o estoque do ERP. Cada linha
                representa um produto; variações existentes mantêm seus
                vínculos.
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {IMPORT_FIELDS.map((field) => (
                  <div key={field.key} className="rounded-lg border p-4">
                    <Label htmlFor={`map-${field.key}`}>{field.label}</Label>
                    <select
                      id={`map-${field.key}`}
                      className={`${selectClass} mt-2`}
                      value={mapping[field.key] ?? ""}
                      onChange={(event) => {
                        const next = { ...mapping }
                        if (event.target.value === "") delete next[field.key]
                        else next[field.key] = Number(event.target.value)
                        setMapping(next)
                        clearPreview()
                      }}
                    >
                      <option value="">Não importar este campo</option>
                      {(sheet.rows[header] ?? []).map((cell, i) => (
                        <option key={i} value={i}>
                          Coluna {i + 1}: {cell.text || "Sem título"}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 min-h-5 truncate text-xs text-muted-foreground">
                      {mapping[field.key] !== undefined
                        ? `Exemplo: ${sheet.rows[header + 1]?.[mapping[field.key]!]?.text || "célula vazia"}`
                        : "Dados existentes serão preservados."}
                    </p>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => void review()}
                disabled={
                  mapped.errors.length > 0 ||
                  mapping[matchBy] === undefined ||
                  !mapped.rows.length
                }
              >
                {preview
                  ? "Atualizar conferência"
                  : `Conferir produtos (${mapped.rows.length})`}
              </Button>
              {mapping[matchBy] === undefined && (
                <p className="text-sm">
                  Relacione a coluna de{" "}
                  {matchBy === "sku" ? "SKU" : "código LiveCart"} para
                  continuar.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </fieldset>
      {busy && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-md border p-4"
        >
          <Loader2 className="h-5 w-5 animate-spin" />
          {busy === "read"
            ? "Lendo planilha…"
            : busy === "preview"
              ? "Conferindo com o catálogo…"
              : "Salvando produtos. Aguarde a confirmação…"}
          {busy === "read" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                generation.current++
                stopWorker()
                setBusy(null)
              }}
            >
              Cancelar leitura
            </Button>
          )}
        </div>
      )}
      {allErrors.length > 0 && (
        <section
          role="alert"
          className="space-y-3 rounded-lg border border-destructive/30 p-4"
        >
          <h2 className="font-semibold">
            Corrija {allErrors.length} pendências antes de importar
          </h2>
          <ul className="max-h-48 list-inside list-disc overflow-auto text-sm">
            {allErrors.slice(0, 50).map((e, i) => (
              <li key={i}>
                {e.row ? `Linha ${e.row}: ` : ""}
                {e.message}
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              download(errorCSV(allErrors), "pendencias-importacao.csv")
            }
          >
            Baixar todas as pendências
          </Button>
        </section>
      )}
      {preview && (
        <Card
          ref={previewRef}
          tabIndex={-1}
          aria-label="Conferência da importação"
        >
          <CardHeader>
            <CardTitle className="text-lg">Confira antes de salvar</CardTitle>
            <p className="text-sm text-muted-foreground">
              {preview.created} novos · {preview.updated} atualizações ·{" "}
              {preview.invalid} com erro. Nenhum produto foi alterado ainda.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    "Linha",
                    "Ação",
                    "Código",
                    "Produto",
                    "Preço",
                    "Estoque",
                    "Conferência",
                  ].map((title) => (
                    <TableHead key={title}>{title}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.rows.slice(page * 20, page * 20 + 20).map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{row.row}</TableCell>
                    <TableCell>
                      {
                        {
                          create: "Criar",
                          update: "Atualizar",
                          invalid: "Corrigir",
                        }[row.action]
                      }
                    </TableCell>
                    <TableCell className="font-mono">
                      {row.keyword || "—"}
                    </TableCell>
                    <TableCell className="min-w-40">
                      {row.name || "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatCurrency(row.price)}
                    </TableCell>
                    <TableCell>{row.stock}</TableCell>
                    <TableCell className="min-w-52 text-xs">
                      {[...row.errors, ...row.warnings].join(" ") || "Pronto"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between text-sm">
              <span>
                Página {page + 1} de{" "}
                {Math.max(1, Math.ceil(preview.rows.length / 20))}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(page + 1) * 20 >= preview.rows.length}
                  onClick={() => setPage(page + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
            <label className="flex items-start gap-3 rounded-md bg-muted/40 p-4 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-primary"
                checked={confirmed}
                disabled={!!busy || preview.invalid > 0 || !request}
                onChange={(event) => setConfirmed(event.target.checked)}
              />
              Conferi os dados e autorizo criar {preview.created} produtos e
              atualizar {preview.updated} existentes. Campos ausentes serão
              preservados.
            </label>
            <Button
              disabled={!confirmed || !!busy || preview.invalid > 0 || !request}
              onClick={() => void apply()}
            >
              Confirmar importação
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
