import { z } from "zod"

// =============================================================================
// MULTI-STEP FORM SCHEMAS
// =============================================================================

// Step 1: Event Type Selection
export const eventTypeSchema = z.object({
  type: z.enum(["single", "multi"], {
    message: "Selecione o tipo de evento",
  }),
})

export type EventTypeFormData = z.infer<typeof eventTypeSchema>

// Step 2: Event Details
export const eventDetailsSchema = z.object({
  title: z
    .string()
    .min(1, "Titulo e obrigatorio")
    .max(200, "Titulo deve ter no maximo 200 caracteres"),
})

export type EventDetailsFormData = z.infer<typeof eventDetailsSchema>

// Step 3: Platform Connection (optional) - Only Instagram supported
export const platformConnectionSchema = z.object({
  platform: z.literal("instagram").optional(),
  platformLiveId: z
    .string()
    .min(1, "ID da live e obrigatorio")
    .max(100, "ID da live deve ter no maximo 100 caracteres"),
})

export type PlatformConnectionFormData = z.infer<typeof platformConnectionSchema>

// Combined schema for full event creation (used by API)
export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, "Titulo e obrigatorio")
    .max(200, "Titulo deve ter no maximo 200 caracteres"),
  type: z.enum(["single", "multi"]).optional(),
  platform: z.literal("instagram").optional(), // Only Instagram supported
  platformLiveId: z.string().max(100).optional(),
  // Scheduling (optional)
  scheduledAt: z.string().nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  // Cart settings (override store defaults)
  closeCartOnEventEnd: z.boolean().optional(),
  cartExpirationMinutes: z.number().min(5).max(1440).nullable().optional(),
  cartMaxQuantityPerItem: z.number().min(1).max(100).nullable().optional(),
  freeShipping: z.boolean().optional(),
})

export type CreateEventFormData = z.infer<typeof createEventSchema>

// =============================================================================
// OTHER SCHEMAS
// =============================================================================

export const updateEventSchema = z.object({
  title: z
    .string()
    .min(1, "Titulo e obrigatorio")
    .max(200, "Titulo deve ter no maximo 200 caracteres"),
})

export type UpdateEventFormData = z.infer<typeof updateEventSchema>

export const createSessionSchema = z.object({
  platform: z.literal("instagram").optional(), // Only Instagram supported
  platformLiveId: z
    .string()
    .min(1, "ID da live e obrigatorio")
    .max(100, "ID da live deve ter no maximo 100 caracteres"),
})

export type CreateSessionFormData = z.infer<typeof createSessionSchema>

export const addPlatformSchema = z.object({
  platform: z.literal("instagram").optional(), // Only Instagram supported
  platformLiveId: z
    .string()
    .min(1, "ID da live e obrigatorio")
    .max(100, "ID da live deve ter no maximo 100 caracteres"),
})

export type AddPlatformFormData = z.infer<typeof addPlatformSchema>
