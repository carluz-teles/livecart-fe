import { cart } from "../../../../../fixtures/cart-edit"
const attempts=new Map<string,number>()
export async function GET(request:Request,{params}:{params:Promise<{token:string}>}) {
 const {token}=await params
 if(token === "merged-vip") return Response.json({reason:"CART_MERGED",error:"Este carrinho foi incorporado a um carrinho VIP. Fale com a loja para receber o link do carrinho VIP."},{status:422})
 if(token === "store-cancelled") return Response.json({error:"Este carrinho foi cancelado pela loja. Fale com a loja para receber um novo link."},{status:422})
 if(token === "expired-domain") return Response.json({reason:"CART_EXPIRED",error:"carrinho expirado"},{status:422})
 if(token.startsWith("timeout")) await new Promise(resolve=>setTimeout(resolve,9000))
 const count=attempts.get(token)||0;attempts.set(token,count+1)
 if(token.startsWith("unavailable") && (count===0 || token.startsWith("unavailable-always"))) return Response.json({error:"Serviço temporariamente indisponível"},{status:503})
 if(token.startsWith("invalid")) return Response.json({data:null})
 if(token.startsWith("malformed")) return new Response("not-json",{status:200})
 if(token.startsWith("expired")) return Response.json({error:"Este carrinho expirou"},{status:422})
 return Response.json({data:{...cart,token,allowEdit:false,requireCustomerData:false,
 paymentStatus:token.startsWith("paid")?"paid":"pending",
 payment:token.startsWith("paid-method-")?{method:token.slice("paid-method-".length),paidAt:"2026-10-18T13:00:00Z",paymentId:"test-payment",cardBrand:"visa",lastFourDigits:"4242",installments:2,authorizationCode:"auth-test"}:null,
 platformHandle:token.startsWith("crash")?{invalid:"object"}:cart.platformHandle,
 store:{...cart.store,checkoutEnabled:false,shippingEnabled:false}}})
}
