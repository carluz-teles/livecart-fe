import { expect, test } from "@playwright/test"
import { randomUUID } from "node:crypto"
import { parseCheckoutDiagnostic, checkoutBrowserContext } from "../src/lib/checkout-diagnostics"
import { POST } from "../src/app/cart/diagnostics/route"

const event = () => ({attemptId:randomUUID(),checkoutReference:"a".repeat(16),event:"script_load_error",elapsedMs:20,online:true})
const request = (body:unknown,headers:Record<string,string>={})=>new Request("http://localhost/cart/diagnostics",{method:"POST",headers:{"content-type":"application/json",...headers},body:JSON.stringify(body)})

test("diagnóstico aceita somente campos limitados sem dados sensíveis",async()=>{
 expect(parseCheckoutDiagnostic(event())).not.toBeNull()
 for(const value of [null,[],{}, {...event(),token:"bearer-secret"},{...event(),url:"https://private/cart/token"},{...event(),event:"Error containing PII"},{...event(),elapsedMs:Infinity},{...event(),elapsedMs:-1},{...event(),attemptId:"\nforged log"},{...event(),checkoutReference:"full-token"}]) expect(parseCheckoutDiagnostic(value)).toBeNull()
 const info=checkoutBrowserContext("Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) Mobile/15E148 Instagram 350.0.0 sensitive-suffix")
 expect(info).toEqual({browser:"instagram",browserMajor:null,os:"ios",iosMajor:17})
})

test("coletor rejeita PII, corpo excessivo, origem externa e limita repetição",async()=>{
 const original=console.info
 const lines:string[]=[]
 console.info=(line:string)=>{lines.push(line)}
 try {
  const data=event()
  expect((await POST(request({...data,token:"secret"}))).status).toBe(400)
  expect((await POST(request({...data,extra:"x".repeat(2048)}))).status).toBe(400)
  expect((await POST(request(data,{origin:"https://attacker.test"}))).status).toBe(403)
  expect((await POST(request(data,{"sec-fetch-site":"cross-site"}))).status).toBe(403)
  expect((await POST(request(data,{"content-type":"text/plain"}))).status).toBe(415)
  for(let i=0;i<8;i++) expect((await POST(request(data))).status).toBe(204)
  expect((await POST(request(data))).status).toBe(429)
  expect(lines).toHaveLength(8)
  expect(lines.join(" ")).not.toContain("secret")
  expect(JSON.parse(lines[0])).toMatchObject({source:"untrusted_browser",event:"script_load_error"})
 } finally {console.info=original}
})

test("coletor limita stream sem Content-Length e corpo que nunca termina",async()=>{
 const stream=new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode("x".repeat(2048)))}})
 const large=new Request("http://localhost/cart/diagnostics",{method:"POST",headers:{"content-type":"application/json"},body:stream,duplex:"half"} as RequestInit)
 expect((await POST(large)).status).toBe(400)
 const hanging=new Request("http://localhost/cart/diagnostics",{method:"POST",headers:{"content-type":"application/json"},body:new ReadableStream(),duplex:"half"} as RequestInit)
 expect((await POST(hanging)).status).toBe(400)
})

test("diagnóstico aceita apenas categorias e posição de asset, nunca mensagem ou URL", () => {
 const detail={...event(),errorType:"TypeError",errorCode:"property_access",errorSource:"app_chunk",phase:"ready",asset:"1234-abcd1234",line:1,column:10240}
 expect(parseCheckoutDiagnostic(detail)).toEqual(detail)
 for(const extra of [{message:"cliente@example.com"},{stack:"/cart/token"},{asset:"https://example.com/token"},{errorType:"cliente"},{errorCode:"token"},{line:-1},{column:Infinity},{phase:"checkout/token"}]) {
  expect(parseCheckoutDiagnostic({...detail,...extra})).toBeNull()
 }
})
