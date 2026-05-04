"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { useCreateComment } from "@/hooks/idea"
import {
  createCommentSchema,
  type CreateCommentFormData,
} from "@/schemas/idea.schema"

interface ReplyComposerProps {
  ideaId: string
  parentCommentId?: string
  onDone?: () => void
  autoFocus?: boolean
}

export function ReplyComposer({
  ideaId,
  parentCommentId,
  onDone,
  autoFocus,
}: ReplyComposerProps) {
  const createComment = useCreateComment(ideaId)
  const form = useForm<CreateCommentFormData>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: { body: "", parentCommentId },
  })

  function handleSubmit(values: CreateCommentFormData) {
    createComment.mutate(
      { body: values.body, parentCommentId: parentCommentId ?? undefined },
      {
        onSuccess: () => {
          form.reset({ body: "", parentCommentId })
          onDone?.()
        },
      },
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  rows={3}
                  autoFocus={autoFocus}
                  placeholder={
                    parentCommentId
                      ? "Escreva uma resposta..."
                      : "Adicione um comentário..."
                  }
                  maxLength={5000}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-end gap-2">
          {onDone && (
            <Button type="button" variant="ghost" size="sm" onClick={onDone}>
              Cancelar
            </Button>
          )}
          <Button type="submit" size="sm" disabled={createComment.isPending}>
            {createComment.isPending
              ? "Enviando..."
              : parentCommentId
                ? "Responder"
                : "Comentar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
