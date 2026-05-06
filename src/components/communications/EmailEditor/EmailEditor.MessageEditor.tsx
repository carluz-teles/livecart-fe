"use client"

import { useEffect, useImperativeHandle, useMemo, useState, forwardRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"

import type { TemplateVariable } from "@/types/notification.types"

import { EmailToolbar } from "./EmailEditor.Toolbar"
import { EmailLinkDialog } from "./EmailEditor.LinkDialog"

import "./email-editor.css"

export interface EmailMessageEditorHandle {
  setHTML: (html: string) => void
}

interface EmailMessageEditorProps {
  initialHTML: string
  variables: TemplateVariable[]
  onHTMLChange: (html: string) => void
}

// Email-flavored TipTap editor. Output HTML is stored in body_html and
// substituted with {variables} at send time on the BE. The shell wraps the
// final output. We deliberately scope StarterKit to email-safe nodes only:
// no code blocks (most clients render them ugly). Lists, blockquote,
// headings 2-3, bold/italic/underline/strike, links and text alignment are
// the supported feature set.
export const EmailMessageEditor = forwardRef<EmailMessageEditorHandle, EmailMessageEditorProps>(
  function EmailMessageEditor({ initialHTML, variables, onHTMLChange }, ref) {
    const safeInitial = useMemo(() => initialHTML || "<p></p>", [initialHTML])
    const [linkDialogOpen, setLinkDialogOpen] = useState(false)

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
          codeBlock: false,
        }),
        Placeholder.configure({
          placeholder: "Escreva o corpo do email...",
        }),
        Underline,
        TextAlign.configure({
          types: ["heading", "paragraph"],
          defaultAlignment: "left",
        }),
        Link.configure({
          openOnClick: false,
          // autolink + linkOnPaste cover the common cases: pasting a URL
          // becomes a clickable link without needing the dialog every time.
          autolink: true,
          linkOnPaste: true,
          HTMLAttributes: {
            // target=_blank + rel=noopener so links work the same in the
            // editor preview and inside the actual sent email.
            target: "_blank",
            rel: "noopener noreferrer nofollow",
          },
        }),
      ],
      content: safeInitial,
      editorProps: {
        attributes: {
          class:
            "email-editor-content min-h-[260px] outline-none text-[15px] leading-[1.6] text-foreground",
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
      if (!editor) return
      const current = editor.getHTML()
      if (initialHTML && initialHTML !== current && current === "<p></p>") {
        editor.commands.setContent(initialHTML)
      }
    }, [editor, initialHTML])

    if (!editor) {
      return <div className="rounded-md border bg-card p-4 min-h-[280px]" />
    }

    const handleApplyLink = (url: string) => {
      if (!url) {
        editor.chain().focus().unsetLink().run()
        return
      }
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run()
    }

    return (
      <div className="rounded-xl border bg-muted/30">
        <EmailToolbar
          editor={editor}
          variables={variables}
          onRequestLink={() => setLinkDialogOpen(true)}
        />

        <div className="px-3 pb-3">
          <div className="rounded-lg border bg-card p-4 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-ring/15">
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/60 px-4 py-2 text-xs text-muted-foreground">
          <span>
            Use {"{numero_pedido}"}, {"{tracking_code}"} e outras variáveis para personalizar.
          </span>
          <span>Deixe vazio para usar o template padrão.</span>
        </div>

        <EmailLinkDialog
          open={linkDialogOpen}
          onOpenChange={setLinkDialogOpen}
          initialURL={(editor.getAttributes("link").href as string) ?? ""}
          onApply={handleApplyLink}
        />
      </div>
    )
  },
)
