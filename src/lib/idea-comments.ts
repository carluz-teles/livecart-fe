import type { IdeaCommentNode } from "@/types/idea.types"

export function getDescendantCount(node: IdeaCommentNode): number {
  return node.replies.reduce(
    (acc, reply) => acc + 1 + getDescendantCount(reply),
    0,
  )
}
