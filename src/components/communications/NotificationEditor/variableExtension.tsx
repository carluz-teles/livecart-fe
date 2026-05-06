"use client"

import { Node, mergeAttributes } from "@tiptap/core"
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react"

import { variableFriendlyNames } from "@/schemas/checkout-settings.schema"

// Variable is an atomic inline node that renders as a pill chip but serializes
// back to "{name}" plain text when we hand the template to the API.
export const VariableExtension = Node.create({
  name: "variable",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      name: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-variable-name") ?? "",
        renderHTML: (attrs) => ({ "data-variable-name": attrs.name }),
      },
    }
  },
  parseHTML() {
    return [{ tag: "span[data-variable]" }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes({ "data-variable": "" }, HTMLAttributes),
      0,
    ]
  },
  addNodeView() {
    return ReactNodeViewRenderer(VariablePill)
  },
})

function VariablePill({ node }: NodeViewProps) {
  const name = (node.attrs.name as string) || ""
  const friendly =
    variableFriendlyNames[`{${name}}`] ?? name.replace(/_/g, " ")
  return (
    <NodeViewWrapper
      as="span"
      className="inline-flex items-center gap-1 mx-[1px] px-2 py-[1px] rounded-full bg-accent border border-accent-foreground/15 text-accent-foreground text-[13px] font-medium align-middle select-none"
      contentEditable={false}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
      <span>{friendly}</span>
    </NodeViewWrapper>
  )
}

// =============================================================================
// Serialization between plain-text template ({handle}) and TipTap JSON document
// =============================================================================

const VARIABLE_RE = /\{([a-z_]+)\}/g

interface JSONNode {
  type: string
  text?: string
  content?: JSONNode[]
  attrs?: Record<string, unknown>
}

export function templateToDoc(
  template: string,
  knownVariableNames: Set<string>,
): JSONNode {
  const lines = template.split("\n")
  const paragraphs: JSONNode[] = lines.map((line) => {
    const content = inlineNodes(line, knownVariableNames)
    return content.length > 0
      ? { type: "paragraph", content }
      : { type: "paragraph" }
  })
  if (paragraphs.length === 0) {
    paragraphs.push({ type: "paragraph" })
  }
  return { type: "doc", content: paragraphs }
}

function inlineNodes(line: string, known: Set<string>): JSONNode[] {
  const nodes: JSONNode[] = []
  let lastIdx = 0
  // Reset state between lines
  const re = new RegExp(VARIABLE_RE.source, "g")
  let m: RegExpExecArray | null
  while ((m = re.exec(line)) !== null) {
    const [full, name] = m
    if (!known.has(name)) continue
    if (m.index > lastIdx) {
      nodes.push({ type: "text", text: line.slice(lastIdx, m.index) })
    }
    nodes.push({ type: "variable", attrs: { name } })
    lastIdx = m.index + full.length
  }
  if (lastIdx < line.length) {
    nodes.push({ type: "text", text: line.slice(lastIdx) })
  }
  return nodes
}

export function docToTemplate(doc: unknown): string {
  if (!isJSONNode(doc) || !Array.isArray(doc.content)) return ""
  const lines: string[] = []
  for (const block of doc.content) {
    lines.push(blockToLine(block))
  }
  return lines.join("\n")
}

function blockToLine(block: JSONNode): string {
  if (!block.content) return ""
  let out = ""
  for (const child of block.content) {
    if (child.type === "text" && typeof child.text === "string") {
      out += child.text
    } else if (child.type === "variable") {
      const name = (child.attrs?.name as string) || ""
      if (name) out += `{${name}}`
    } else if (child.type === "hardBreak") {
      out += "\n"
    } else if (Array.isArray(child.content)) {
      out += blockToLine(child)
    }
  }
  return out
}

function isJSONNode(v: unknown): v is JSONNode {
  return typeof v === "object" && v !== null && "type" in v
}
