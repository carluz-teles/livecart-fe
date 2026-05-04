import type { IdeaCommentNode } from "@/types/idea.types"

export function getDescendantCount(node: IdeaCommentNode): number {
  return node.replies.reduce(
    (acc, reply) => acc + 1 + getDescendantCount(reply),
    0,
  )
}

// Returns a new tree with `newComment` appended either at the root (when
// parentCommentId is undefined) or inside the matching parent's replies.
// Branches that aren't on the path back to the root are returned unchanged
// to keep React Query's structural sharing intact.
export function insertCommentInTree(
  comments: IdeaCommentNode[],
  parentCommentId: string | undefined,
  newComment: IdeaCommentNode,
): IdeaCommentNode[] {
  if (!parentCommentId) {
    return [...comments, newComment]
  }
  return comments.map((c) => {
    if (c.id === parentCommentId) {
      return { ...c, replies: [...c.replies, newComment] }
    }
    if (c.replies.length === 0) return c
    return {
      ...c,
      replies: insertCommentInTree(c.replies, parentCommentId, newComment),
    }
  })
}
