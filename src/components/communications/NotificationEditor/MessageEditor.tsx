"use client"

import { useEffect, useImperativeHandle, useMemo, useRef } from "react"
import { forwardRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"

import type { TemplateVariable } from "@/types/notification.types"

import {
  VariableExtension,
  docToTemplate,
  templateToDoc,
} from "./variableExtension"
import { NotificationToolbar } from "./NotificationEditor.Toolbar"

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

    // Com immediatelyRender:false (obrigatório no SSR do Next), a instância
    // do TipTap nasce DEPOIS da primeira renderização. Um setTemplate que
    // chegue antes disso — o sync do carregamento das settings chega — era um
    // no-op silencioso: o editor abria com o template default enquanto a
    // prévia mostrava o salvo (20/08/2026, segunda ocorrência). A intenção
    // fica na fila e aplica assim que a instância existir.
    const pendingTemplate = useRef<string | null>(null)

    useImperativeHandle(
      ref,
      () => ({
        setTemplate: (template: string) => {
          if (!editor) {
            pendingTemplate.current = template
            onTemplateChange(template)
            return
          }
          pendingTemplate.current = null
          editor.commands.setContent(templateToDoc(template, knownNames))
          onTemplateChange(template)
        },
      }),
      [editor, knownNames, onTemplateChange],
    )

    useEffect(() => {
      if (!editor || pendingTemplate.current == null) return
      editor.commands.setContent(templateToDoc(pendingTemplate.current, knownNames))
      pendingTemplate.current = null
    }, [editor, knownNames])

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

    const restoreDefault = () => {
      editor.commands.setContent(templateToDoc(defaultTemplate, knownNames))
      onTemplateChange(defaultTemplate)
    }

    const renderedTemplate = docToTemplate(editor.getJSON())
    const byteLen = new TextEncoder().encode(renderedTemplate).length
    const overLimit = byteLen > MAX_BYTES

    return (
      <div className="flex h-full min-h-0 flex-col rounded-xl border bg-muted/30">
        <NotificationToolbar
          editor={editor}
          variables={variables}
          onRestore={restoreDefault}
        />

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
