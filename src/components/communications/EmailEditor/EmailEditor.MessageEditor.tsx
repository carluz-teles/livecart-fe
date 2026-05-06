"use client"

import { useEffect, useImperativeHandle, useMemo, forwardRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { TemplateVariable } from "@/types/notification.types"

import { EmojiPicker } from "../NotificationEditor/EmojiPicker"
import { VariableMenu } from "../NotificationEditor/VariableMenu"

export interface EmailMessageEditorHandle {
  setHTML: (html: string) => void
}

interface EmailMessageEditorProps {
  initialHTML: string
  variables: TemplateVariable[]
  onHTMLChange: (html: string) => void
}

// Email-flavored editor: TipTap with paragraph + bold/italic/link only.
// Output is plain HTML stored in body_html — the BE wraps it in the override
// shell at send time. Variables stay as `{name}` strings inside the HTML so
// the same template substitution applies as in IG DM templates.
export const EmailMessageEditor = forwardRef<EmailMessageEditorHandle, EmailMessageEditorProps>(
  function EmailMessageEditor({ initialHTML, variables, onHTMLChange }, ref) {
    const safeInitial = useMemo(() => initialHTML || "<p></p>", [initialHTML])

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
          placeholder: "Escreva o corpo do email...",
        }),
      ],
      content: safeInitial,
      editorProps: {
        attributes: {
          class:
            "min-h-[220px] outline-none text-[15px] leading-[1.7] text-foreground prose-p:my-0",
        },
      },
      onUpdate: ({ editor }) => {
        onHTMLChange(editor.getHTML())
      },
      immediatelyRender: false,
    })

    useImperativeHandle(
      ref,
      () => ({
        setHTML: (html: string) => {
          if (!editor) return
          editor.commands.setContent(html || "<p></p>")
          onHTMLChange(html)
        },
      }),
      [editor, onHTMLChange],
    )

    useEffect(() => {
      // Sync external content updates (e.g. when the loader query resolves
      // after first render). Avoid clobbering local edits if the external
      // value matches what's already in the editor.
      if (!editor) return
      const current = editor.getHTML()
      if (initialHTML && initialHTML !== current && current === "<p></p>") {
        editor.commands.setContent(initialHTML)
      }
    }, [editor, initialHTML])

    if (!editor) {
      return <div className="rounded-md border bg-card p-4 min-h-[280px]" />
    }

    const insertEmoji = (emoji: string) => {
      editor.chain().focus().insertContent(emoji).run()
    }

    const insertVariable = (name: string) => {
      // Variables are stored as literal `{name}` text in the HTML — the BE
      // substitutes at send time, same engine as IG DM templates.
      editor.chain().focus().insertContent(`{${name}}`).run()
    }

    const restoreEmpty = () => {
      editor.commands.setContent("<p></p>")
      onHTMLChange("")
    }

    return (
      <div className="rounded-xl border bg-muted/30">
        <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
          <EmojiPicker onPick={insertEmoji} />
          <VariableMenu variables={variables} onPick={insertVariable} />
          <div className="flex-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-muted-foreground"
            onClick={restoreEmpty}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Limpar
          </Button>
        </div>

        <div className="px-3 pb-3">
          <div className="rounded-lg border bg-card p-4 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-ring/15">
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/60 px-4 py-2 text-xs text-muted-foreground">
          <span>
            Use {"{numero_pedido}"}, {"{tracking_code}"} e outras variáveis para personalizar.
          </span>
          <span>
            Deixe vazio para usar o template padrão da LiveCart.
          </span>
        </div>
      </div>
    )
  },
)
