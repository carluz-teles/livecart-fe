import { SignUp } from "@clerk/nextjs"

export default function RegisterPage() {
  return (
    <SignUp
      routing="path"
      path="/register"
      signInUrl="/login"
      forceRedirectUrl="/dashboard"
    />
  )
}
