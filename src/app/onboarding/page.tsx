import { cookies } from "next/headers"

import { parseWizardDraft } from "@/hooks/onboarding"
import { OnboardingScreen } from "./components/onboarding-screen"

// Server component: lê o rascunho do cookie e entrega o estado inicial já
// resolvido pro client — o SSR renderiza o passo certo, sem flash.
export default async function OnboardingPage() {
  const cookieStore = await cookies()
  const draft = parseWizardDraft(cookieStore.get("lc-onboarding-draft")?.value)

  return <OnboardingScreen initialDraft={draft} />
}
