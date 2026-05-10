"use client"

import { useEffect, useImperativeHandle, useMemo } from "react"
import { forwardRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { TemplateVariable } from "@/types/notification.types"

import {
  VariableExtension,
  docToTemplate,
  templateToDoc,
} from "./variableExtension"
import { EmojiPicker } from "./EmojiPicker"
import { VariableMenu } from "./VariableMenu"

const MAX_BYTES = 1000

export interface MessageEditorHandle {
  setTemplate: (template: string) => void
}

interface MessageEditorProps {
  initialTemplate: string
  defaultTemplate: string
  variables: TemplateVariable[]
  onTemplateChange: (template: string) => void
}

export const MessageEditor = forwardRef<MessageEditorHandle, MessageEditorProps>(
  function MessageEditor(
    { initialTemplate, defaultTemplate, variables, onTemplateChange },
    ref,
  ) {
    const knownNames = useMemo(
      () => new Set(variables.map((v) => v.name.replace(/[{}]/g, ""))),
      [variables],
    )

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: false,
          blockquote: false,
          codeBlock: false,
          horizontalRule: false,
          bulletList: false,
          orderedList: false,
          listItem: false,
        }),
        Placeholder.configure({
          placeholder: "Escreva a mensagem que seu cliente vai receber...",
        }),
        VariableExtension,
      ],
      content: templateToDoc(initialTemplate || defaultTemplate, knownNames),
      editorProps: {
        attributes: {
          class:
            "min-h-[180px] outline-none text-[15px] leading-[1.7] text-foreground prose-p:my-0",
        },
      },
      onUpdate: ({ editor }) => {
        const tpl = docToTemplate(editor.getJSON())
        onTemplateChange(tpl)
      },
      immediatelyRender: false,
    })

    useImperativeHandle(
      ref,
      () => ({
        setTemplate: (template: string) => {
          if (!editor) return
          editor.commands.setContent(templateToDoc(template, knownNames))
          onTemplateChange(template)
        },
      }),
      [editor, knownNames, onTemplateChange],
    )

    // When the variables list arrives later (async), re-parse the doc so any
    // {handle} text already on screen turns into pills.
    useEffect(() => {
      if (!editor) return
      if (knownNames.size === 0) return
      const current = docToTemplate(editor.getJSON())
      // Only rebuild when there is a literal {var} still in the text — avoids
      // the flicker of resetting selection on every keystroke.
      if (/\{[a-z_]+\}/.test(current)) {
        const sel = editor.state.selection
        editor.commands.setContent(templateToDoc(current, knownNames))
        editor.commands.setTextSelection(sel.from)
      }
    }, [editor, knownNames])

    if (!editor) {
      return (
        <div className="rounded-md border bg-card">
          <div className="h-12 border-b" />
          <div className="h-[180px]" />
        </div>
      )
    }

    const insertEmoji = (emoji: string) => {
      editor.chain().focus().insertContent(emoji).run()
    }

    const insertVariable = (name: string) => {
      editor
        .chain()
        .focus()
        .insertContent({ type: "variable", attrs: { name } })
        .run()
    }

    const restoreDefault = () => {
      editor.commands.setContent(templateToDoc(defaultTemplate, knownNames))
      onTemplateChange(defaultTemplate)
    }

    const renderedTemplate = docToTemplate(editor.getJSON())
    const byteLen = new TextEncoder().encode(renderedTemplate).length
    const overLimit = byteLen > MAX_BYTES

    return (
      <div className="flex h-full min-h-0 flex-col rounded-xl border bg-muted/30">
        {/* Toolbar */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 px-3 py-2.5">
          <EmojiPicker onPick={insertEmoji} />
          <VariableMenu variables={variables} onPick={insertVariable} />
          <div className="flex-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-muted-foreground"
            onClick={restoreDefault}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restaurar padrão
          </Button>
        </div>

        {/* Writing surface — distinctly elevated above the panel */}
        <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
          <div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-ring/15">
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <EditorContent editor={editor} />
            </div>
          </div>
          {/* Char progress */}
          <div className="mt-3 h-1 shrink-0 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((byteLen / MAX_BYTES) * 100, 100)}%`,
                background: overLimit
                  ? "hsl(var(--destructive))"
                  : byteLen / MAX_BYTES > 0.8
                    ? "rgb(245 158 11)"
                    : "rgb(16 185 129)",
              }}
            />
          </div>
        </div>

        {/* Footer hint */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border/60 px-4 py-2 text-xs text-muted-foreground">
          <span>
            Aperte{" "}
            <kbd className="rounded border bg-card px-1 font-mono text-[11px]">
              Enter
            </kbd>{" "}
            pra quebrar linha. Cole emojis ou clique em <span className="font-medium">Emoji</span>.
          </span>
          <span className={overLimit ? "text-destructive font-medium" : "font-mono"}>
            {byteLen} / {MAX_BYTES}
          </span>
        </div>
      </div>
    )
  },
)
