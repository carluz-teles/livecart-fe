import { getCheckoutDiagnosticContext } from "@/lib/checkout-diagnostics-server"
import Failure from "./failure"
export default function Page(){
 const context=getCheckoutDiagnosticContext("fixture-error-boundary")
 return <div data-checkout-attempt={context.attemptId} data-checkout-reference={context.checkoutReference} data-checkout-mode="interactive"><Failure /></div>
}
