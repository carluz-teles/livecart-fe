"use client"

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Quote,
  Strikethrough,
  Underline as UnderlineIcon,
  type LucideIcon,
} from "lucide-react"
import { type Editor } from "@tiptap/react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { EmojiPicker } from "../NotificationEditor/EmojiPicker"
import { VariableMenu } from "../NotificationEditor/VariableMenu"
import type { TemplateVariable } from "@/types/notification.types"

interface EmailToolbarProps {
  editor: Editor | null
  variables: TemplateVariable[]
  onRequestLink: () => void
}

// Toolbar grouped into 5 zones (formato | bloco | lista | alinhamento |
// extras) so the cognitive load of the bar mirrors mental categories the
// merchant already has from Gmail/Word: text formatting, paragraph type,
// list layout, alignment, and "add stuff" (emoji, variable).
export function EmailToolbar({ editor, variables, onRequestLink }: EmailToolbarProps) {
  if (!editor) return null

  const insertEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run()
  }
  const insertVariable = (name: string) => {
    editor.chain().focus().insertContent(`{${name}}`).run()
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-wrap items-center gap-1 px-3 py-2.5">
        {/* Group 1: text formatting */}
        <ToolbarGroup>
          <ToolbarToggle
            label="Negrito"
            shortcut="⌘B"
            Icon={Bold}
            isActive={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolbarToggle
            label="Itálico"
            shortcut="⌘I"
            Icon={Italic}
            isActive={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <ToolbarToggle
            label="Sublinhado"
            shortcut="⌘U"
            Icon={UnderlineIcon}
            isActive={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
          <ToolbarToggle
            label="Riscado"
            Icon={Strikethrough}
            isActive={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
        </ToolbarGroup>

        <Divider />

        {/* Group 2: block type */}
        <BlockTypeSelect editor={editor} />

        <Divider />

        {/* Group 3: lists + blockquote */}
        <ToolbarGroup>
          <ToolbarToggle
            label="Lista"
            Icon={List}
            isActive={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolbarToggle
            label="Lista numerada"
            Icon={ListOrdered}
            isActive={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarToggle
            label="Citação"
            Icon={Quote}
            isActive={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
        </ToolbarGroup>

        <Divider />

        {/* Group 4: alignment */}
        <ToolbarGroup>
          <ToolbarToggle
            label="Esquerda"
            Icon={AlignLeft}
            isActive={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          />
          <ToolbarToggle
            label="Centro"
            Icon={AlignCenter}
            isActive={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          />
          <ToolbarToggle
            label="Direita"
            Icon={AlignRight}
            isActive={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          />
        </ToolbarGroup>

        <Divider />

        {/* Group 5: link + hr + extras */}
        <ToolbarGroup>
          <ToolbarToggle
            label="Link"
            Icon={Link2}
            isActive={editor.isActive("link")}
            onClick={onRequestLink}
          />
          {editor.isActive("link") && (
            <ToolbarToggle
              label="Remover link"
              Icon={Link2Off}
              onClick={() => editor.chain().focus().unsetLink().run()}
            />
          )}
          <ToolbarToggle
            label="Linha divisória"
            Icon={Minus}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          />
        </ToolbarGroup>

        <div className="flex-1" />

        {/* Group 6: insert (chip-styled, separate visual treatment) */}
        <div className="flex items-center gap-1">
          <EmojiPicker onPick={insertEmoji} />
          <VariableMenu variables={variables} onPick={insertVariable} />
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
  shortcut?: string
  Icon: LucideIcon
  isActive?: boolean
  onClick: () => void
}

function ToolbarToggle({
  label,
  shortcut,
  Icon,
  isActive,
  onClick,
}: ToolbarToggleProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0",
            isActive && "bg-accent text-accent-foreground",
          )}
          onClick={onClick}
        >
          <Icon className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {label}
        {shortcut && <span className="ml-2 font-mono text-muted-foreground">{shortcut}</span>}
      </TooltipContent>
    </Tooltip>
  )
}

// Block type uses a Select instead of toggle buttons because heading/paragraph
// are mutually exclusive — a Select makes the "current state" obvious and
// keeps the toolbar compact (vs three separate toggles for P/H2/H3).
function BlockTypeSelect({ editor }: { editor: Editor }) {
  const current = editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
      ? "h3"
      : "paragraph"

  const onChange = (value: string) => {
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run()
    } else if (value === "h2") {
      editor.chain().focus().toggleHeading({ level: 2 }).run()
    } else if (value === "h3") {
      editor.chain().focus().toggleHeading({ level: 3 }).run()
    }
  }

  return (
    <Select value={current} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-[140px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="paragraph">Parágrafo</SelectItem>
        <SelectItem value="h2">Título</SelectItem>
        <SelectItem value="h3">Subtítulo</SelectItem>
      </SelectContent>
    </Select>
  )
}
