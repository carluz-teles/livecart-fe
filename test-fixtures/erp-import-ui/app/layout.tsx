import { checkoutDiagnosticsBootstrap } from "@/lib/checkout-diagnostics-bootstrap"
export default function Layout({children}:{children:React.ReactNode}) {
 return <html><head><script dangerouslySetInnerHTML={{__html:checkoutDiagnosticsBootstrap}} /></head><body>{children}</body></html>
}
