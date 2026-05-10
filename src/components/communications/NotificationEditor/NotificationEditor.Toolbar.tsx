"use client"

import { Bold, Italic, List, ListOrdered, RotateCcw, type LucideIcon } from "lucide-react"
import { type Editor } from "@tiptap/react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { TemplateVariable } from "@/types/notification.types"

import { EmojiPicker } from "./EmojiPicker"
import { VariableMenu } from "./VariableMenu"

interface NotificationToolbarProps {
  editor: Editor | null
  variables: TemplateVariable[]
  onRestore: () => void
}

// IG DMs are plain text — we can't ship HTML marks. The toolbar visually
// mirrors EmailEditor.Toolbar but each action lowers to what IG actually
// renders: bold/italic become unicode mathematical chars, lists become "•"
// and "1." line prefixes. No headings, alignment or inline links — IG
// strips all of those.
export function NotificationToolbar({
  editor,
  variables,
  onRestore,
}: NotificationToolbarProps) {
  if (!editor) return null

  const insertEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run()
  }
  const insertVariable = (name: string) => {
    // VariableExtension renders {name} as an atom pill — must insert the node,
    // not raw text, otherwise it'd land as plain "{name}" until next reload.
    editor
      .chain()
      .focus()
      .insertContent({ type: "variable", attrs: { name } })
      .run()
  }

  const applyBold = () => transformSelection(editor, toBold)
  const applyItalic = () => transformSelection(editor, toItalic)
  const applyBullet = () => insertLinePrefixes(editor, () => "• ")
  const applyOrdered = () => insertLinePrefixes(editor, (n) => `${n}. `)

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex shrink-0 flex-wrap items-center gap-1 px-3 py-2.5">
        {/* Format — unicode bold/italic that IG actually renders. */}
        <ToolbarGroup>
          <ToolbarToggle label="Negrito" hint="Bold via unicode" Icon={Bold} onClick={applyBold} />
          <ToolbarToggle label="Itálico" hint="Italic via unicode" Icon={Italic} onClick={applyItalic} />
        </ToolbarGroup>

        <Divider />

        {/* Lists — prefix-based, no actual list nodes. */}
        <ToolbarGroup>
          <ToolbarToggle label="Lista" hint='Adiciona "• " no início' Icon={List} onClick={applyBullet} />
          <ToolbarToggle label="Lista numerada" hint='Adiciona "1. " no início' Icon={ListOrdered} onClick={applyOrdered} />
        </ToolbarGroup>

        <div className="flex-1" />

        {/* Insert */}
        <div className="flex items-center gap-1">
          <EmojiPicker onPick={insertEmoji} />
          <VariableMenu variables={variables} onPick={insertVariable} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-muted-foreground"
                onClick={onRestore}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restaurar
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Volta para o template padrão
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-border/60" />
}

interface ToolbarToggleProps {
  label: string
  hint?: string
  Icon: LucideIcon
  onClick: () => void
}

function ToolbarToggle({ label, hint, Icon, onClick }: ToolbarToggleProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onClick}
        >
          <Icon className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {label}
        {hint && (
          <span className="ml-2 text-muted-foreground">{hint}</span>
        )}
      </TooltipContent>
    </Tooltip>
  )
}

// --- Unicode formatting helpers ---

const BOLD_MAP: Record<string, string> = {
  A: "𝐀", B: "𝐁", C: "𝐂", D: "𝐃", E: "𝐄", F: "𝐅", G: "𝐆", H: "𝐇",
  I: "𝐈", J: "𝐉", K: "𝐊", L: "𝐋", M: "𝐌", N: "𝐍", O: "𝐎", P: "𝐏",
  Q: "𝐐", R: "𝐑", S: "𝐒", T: "𝐓", U: "𝐔", V: "𝐕", W: "𝐖", X: "𝐗",
  Y: "𝐘", Z: "𝐙",
  a: "𝐚", b: "𝐛", c: "𝐜", d: "𝐝", e: "𝐞", f: "𝐟", g: "𝐠", h: "𝐡",
  i: "𝐢", j: "𝐣", k: "𝐤", l: "𝐥", m: "𝐦", n: "𝐧", o: "𝐨", p: "𝐩",
  q: "𝐪", r: "𝐫", s: "𝐬", t: "𝐭", u: "𝐮", v: "𝐯", w: "𝐰", x: "𝐱",
  y: "𝐲", z: "𝐳",
  "0": "𝟎", "1": "𝟏", "2": "𝟐", "3": "𝟑", "4": "𝟒",
  "5": "𝟓", "6": "𝟔", "7": "𝟕", "8": "𝟖", "9": "𝟗",
}

const ITALIC_MAP: Record<string, string> = {
  A: "𝐴", B: "𝐵", C: "𝐶", D: "𝐷", E: "𝐸", F: "𝐹", G: "𝐺", H: "𝐻",
  I: "𝐼", J: "𝐽", K: "𝐾", L: "𝐿", M: "𝑀", N: "𝑁", O: "𝑂", P: "𝑃",
  Q: "𝑄", R: "𝑅", S: "𝑆", T: "𝑇", U: "𝑈", V: "𝑉", W: "𝑊", X: "𝑋",
  Y: "𝑌", Z: "𝑍",
  a: "𝑎", b: "𝑏", c: "𝑐", d: "𝑑", e: "𝑒", f: "𝑓", g: "𝑔", h: "ℎ",
  i: "𝑖", j: "𝑗", k: "𝑘", l: "𝑙", m: "𝑚", n: "𝑛", o: "𝑜", p: "𝑝",
  q: "𝑞", r: "𝑟", s: "𝑠", t: "𝑡", u: "𝑢", v: "𝑣", w: "𝑤", x: "𝑥",
  y: "𝑦", z: "𝑧",
}

function toBold(text: string): string {
  return Array.from(text).map((c) => BOLD_MAP[c] ?? c).join("")
}

function toItalic(text: string): string {
  return Array.from(text).map((c) => ITALIC_MAP[c] ?? c).join("")
}

function transformSelection(editor: Editor, transform: (s: string) => string) {
  const { from, to } = editor.state.selection
  if (from === to) return
  const text = editor.state.doc.textBetween(from, to, "\n")
  editor.chain().focus().insertContentAt({ from, to }, transform(text)).run()
}

// Walks every paragraph in the selection and prepends a prefix at the line
// start. Reverse-iterates so each insertion doesn't shift the positions of
// the ones we haven't visited yet.
function insertLinePrefixes(editor: Editor, makePrefix: (i: number) => string) {
  const { from, to } = editor.state.selection
  const paragraphs: number[] = []

  editor.state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name === "paragraph") {
      paragraphs.push(pos + 1)
    }
  })

  if (paragraphs.length === 0) {
    const { $from } = editor.state.selection
    const start = $from.start($from.depth)
    editor.chain().focus().insertContentAt(start, makePrefix(1)).run()
    return
  }

  paragraphs.reverse()
  let chain = editor.chain().focus()
  for (let i = 0; i < paragraphs.length; i++) {
    const number = paragraphs.length - i
    chain = chain.insertContentAt(paragraphs[i]!, makePrefix(number))
  }
  chain.run()
}
