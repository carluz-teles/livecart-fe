import type { Appearance } from "@clerk/types"

export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "hsl(37.69 92.13% 50.2%)", // amber primary
    colorText: "hsl(0 0% 14.9%)",
    colorTextSecondary: "hsl(220 8.94% 46.08%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInputBackground: "hsl(0 0% 100%)",
    colorInputText: "hsl(0 0% 14.9%)",
    colorNeutral: "hsl(220 8.94% 46.08%)",
    borderRadius: "0.375rem",
  },
  elements: {
    // Root
    rootBox: "w-full",
    card: "shadow-none border rounded-lg bg-card",

    // Header
    headerTitle: "text-2xl font-semibold tracking-tight text-foreground",
    headerSubtitle: "text-sm text-muted-foreground",

    // Form
    formButtonPrimary:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    formButtonReset:
      "text-primary hover:text-primary/90",
    formFieldLabel: "text-sm font-medium text-foreground",
    formFieldInput:
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
    formFieldAction: "text-primary hover:text-primary/90",
    formFieldErrorText: "text-sm text-destructive",
    formFieldSuccessText: "text-sm text-green-600",

    // Social buttons
    socialButtonsBlockButton:
      "flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors",
    socialButtonsBlockButtonText: "text-foreground",
    socialButtonsProviderIcon: "w-5 h-5",

    // Divider
    dividerLine: "bg-border",
    dividerText: "text-xs text-muted-foreground bg-background px-2",

    // Footer
    footer: "bg-transparent",
    footerAction: "text-sm",
    footerActionText: "text-muted-foreground",
    footerActionLink: "text-primary hover:text-primary/90 font-medium",

    // Identity preview
    identityPreviewText: "text-foreground",
    identityPreviewEditButton: "text-primary hover:text-primary/90",

    // User button
    userButtonBox: "rounded-full",
    userButtonTrigger: "rounded-full",
    userButtonAvatarBox: "w-8 h-8",
    userButtonPopoverCard: "shadow-lg border rounded-lg",
    userButtonPopoverActionButton: "hover:bg-accent",
    userButtonPopoverActionButtonText: "text-foreground",
    userButtonPopoverActionButtonIcon: "text-muted-foreground",
    userButtonPopoverFooter: "hidden",

    // Alert
    alertText: "text-sm",

    // Badge
    badge: "bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded",

    // Avatar
    avatarBox: "rounded-full",

    // Card actions
    cardBox: "shadow-none",

    // OTP
    otpCodeFieldInput:
      "flex h-12 w-12 items-center justify-center rounded-md border border-input bg-background text-lg font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",

    // Phone input
    phoneInputBox: "flex gap-2",

    // Select
    selectButton:
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
    selectOptionsContainer: "rounded-md border bg-popover shadow-lg",
    selectOption: "px-3 py-2 text-sm hover:bg-accent cursor-pointer",
  },
}

// Dark mode overrides
export const clerkDarkAppearance: Appearance = {
  variables: {
    colorPrimary: "hsl(37.69 92.13% 50.2%)", // amber primary
    colorText: "hsl(0 0% 89.8%)",
    colorTextSecondary: "hsl(0 0% 63.92%)",
    colorBackground: "hsl(0 0% 14.9%)",
    colorInputBackground: "hsl(0 0% 9.02%)",
    colorInputText: "hsl(0 0% 89.8%)",
    colorNeutral: "hsl(0 0% 63.92%)",
    borderRadius: "0.375rem",
  },
  elements: clerkAppearance.elements,
}
