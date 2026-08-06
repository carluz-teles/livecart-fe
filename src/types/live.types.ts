/**
 * O que sobrou do vocabulário antigo, quando um "evento" era uma live só.
 *
 * O resto deste arquivo — `LiveEvent`, `LiveSession`, `LiveStats.totalLives`,
 * `CreateLiveEventPayload`, os filtros — descrevia a tela `/lives`, que virou
 * redirect para `/events`. Era um modelo paralelo do MESMO recurso, com um
 * `type: "single" | "multi"` próprio: qualquer varredura por "quem ainda lê o
 * tipo do evento" tropeçava nele.
 *
 * Ficaram só os dois enums que descrevem coisas que continuam existindo: o
 * status de uma transmissão e a plataforma onde ela acontece.
 */

export type LiveStatus = "scheduled" | "active" | "live" | "ended" | "cancelled"
export type LivePlatform = "instagram" | "tiktok" | "youtube" | "facebook"
