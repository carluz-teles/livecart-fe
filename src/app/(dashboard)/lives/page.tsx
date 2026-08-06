import { redirect } from "next/navigation"

/**
 * `/lives` foi a tela de "lives" quando um evento era uma transmissão só.
 *
 * Ela não estava no menu desde a criação de `/events`, mas continuava acessível
 * por URL, chamando os mesmos endpoints com o vocabulário antigo — inclusive um
 * botão "Iniciar live" que não mudava nada. Manter duas telas para a mesma
 * entidade é o tipo de coisa que só é descoberta por um lojista com o link
 * salvo, no pior momento. O redirect existe para esse link não virar 404.
 */
export default function LegacyLivesPage() {
  redirect("/events")
}
