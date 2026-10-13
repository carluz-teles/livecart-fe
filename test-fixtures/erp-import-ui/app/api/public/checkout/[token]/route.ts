import { cart } from "../../../../../fixtures/cart-edit"
const attempts=new Map<string,number>()
export async function GET(request:Request,{params}:{params:Promise<{token:string}>}) {
 const {token}=await params
 if(token.startsWith("timeout")) await new Promise(resolve=>setTimeout(resolve,9000))
 const count=attempts.get(token)||0;attempts.set(token,count+1)
 if(token.startsWith("unavailable") && (count===0 || token.startsWith("unavailable-always"))) return Response.json({error:"Serviço temporariamente indisponível"},{status:503})
 if(token.startsWith("invalid")) return Response.json({data:null})
 if(token.startsWith("malformed")) return new Response("not-json",{status:200})
 if(token.startsWith("expired")) return Response.json({error:"Este carrinho expirou"},{status:422})
 return Response.json({data:{...cart,token,allowEdit:false,requireCustomerData:false,
 paymentStatus:token.startsWith("paid")?"paid":"pending",
 platformHandle:token.startsWith("crash")?{invalid:"object"}:cart.platformHandle,
 store:{...cart.store,checkoutEnabled:false,shippingEnabled:false}}})
}
