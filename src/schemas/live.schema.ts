import { z } from "zod"

// Schema for event type selection (step 1)
export const eventTypeSchema = z.object({
  type: z.enum(["single", "multi"], {
    message: "Selecione o tipo de evento",
  }),
})

// Schema for event details (step 2)
export const eventDetailsSchema = z.object({
  title: z
    .string()
    .min(1, "Título é obrigatório")
    .max(200, "Título deve ter no máximo 200 caracteres"),
})

// Schema for platform connection (step 3 - optional)
export const platformConnectionSchema = z.object({
  platform: z.enum(["instagram", "facebook", "youtube", "tiktok"], {
    message: "Selecione a plataforma",
  }),
  platformLiveId: z
    .string()
    .min(1, "ID da live é obrigatório")
    .max(100, "ID da live deve ter no máximo 100 caracteres"),
})

// Combined schema for full event creation
export const createEventSchema = z.object({
  type: z.enum(["single", "multi"]),
  title: z.string().min(1).max(200),
  platform: z.enum(["instagram", "facebook", "youtube", "tiktok"]).optional(),
  platformLiveId: z.string().max(100).optional(),
})

export type EventTypeFormData = z.infer<typeof eventTypeSchema>
export type EventDetailsFormData = z.infer<typeof eventDetailsSchema>
export type PlatformConnectionFormData = z.infer<typeof platformConnectionSchema>
export type CreateEventFormData = z.infer<typeof createEventSchema>

// Legacy alias
export const createLiveSchema = platformConnectionSchema
export type CreateLiveFormData = PlatformConnectionFormData
