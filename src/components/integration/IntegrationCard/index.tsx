"use client"

import { IntegrationCardRoot } from "./IntegrationCard.Root"
import { IntegrationCardLogo } from "./IntegrationCard.Logo"
import { IntegrationCardContent } from "./IntegrationCard.Content"
import { IntegrationCardStatus } from "./IntegrationCard.Status"
import { IntegrationCardActions } from "./IntegrationCard.Actions"

export const IntegrationCard = Object.assign(IntegrationCardRoot, {
  Logo: IntegrationCardLogo,
  Content: IntegrationCardContent,
  Status: IntegrationCardStatus,
  Actions: IntegrationCardActions,
})

export type { IntegrationCardRootProps } from "./IntegrationCard.Root"
