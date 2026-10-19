import { expect, test, type Page } from "@playwright/test"
import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"

async function diagnostics(page:Page) {
 const events:Record<string,unknown>[]=[]
 await page.route("**/cart/diagnostics",async route=>{
  expect(route.request().headers()["referer"]).toBeUndefined()
  events.push(route.request().postDataJSON())
  await route.fulfill({status:204})
 })
 return events
}
function serverLogs(){return readFileSync("/tmp/livecart-checkout-fixture-20261013.log","utf8").split("\n").filter(line=>line.startsWith('{"message":"checkout_server_fetch"')).map(line=>JSON.parse(line))}

test("checkout normal correlaciona servidor e navegador sem expor o token",async({page})=>{
 const token="normal-confidential-checkout-token"
 const events=await diagnostics(page)
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message))
 await page.goto(`/cart/${token}`)
 await expect(page.getByText("Bola de teste").first()).toBeVisible()
 await expect.poll(()=>events.map(e=>e.event)).toContain("checkout_ready")
 const attempt=await page.locator("[data-checkout-attempt]").getAttribute("data-checkout-attempt")
 expect(events.every(e=>e.attemptId===attempt)).toBe(true)
 expect(events[0].checkoutReference).toBe(createHash("sha256").update(token).digest("hex").slice(0,16))
 expect(JSON.stringify(events)).not.toContain(token)
 expect(serverLogs().find(e=>e.attemptId===attempt)).toMatchObject({outcome:"success",status:200})
 expect(JSON.stringify(serverLogs())).not.toContain(token)
 expect(errors).toEqual([])
})

test("script do Next recusado é registrado antes de hidratar e tem timeout",async({page})=>{
 const events=await diagnostics(page)
 await page.clock.install()
 await page.route("**/_next/static/**/*.js*",route=>route.abort())
 await page.goto("/cart/chunk-failure",{waitUntil:"domcontentloaded"})
 await expect.poll(()=>events.map(e=>e.event)).toContain("script_load_error")
 await page.clock.fastForward(21_000)
 await expect.poll(()=>events.map(e=>e.event)).toContain("hydration_timeout")
 expect(events.filter(e=>e.event==="script_load_error")).toHaveLength(1)
 expect(events.map(e=>e.event)).not.toContain("checkout_ready")
})

test("erro do servidor mostra referência e retry carrega recuperação",async({page},testInfo)=>{
 const events=await diagnostics(page)
 await page.goto(`/cart/unavailable-retry-${testInfo.project.name}`)
 await expect(page.getByText("Serviço temporariamente indisponível")).toBeVisible()
 await expect(page.getByText(/Referência:/)).toBeVisible()
 await expect.poll(()=>events.map(e=>e.event)).toContain("server_error_screen")
 const first=await page.locator("[data-checkout-attempt]").getAttribute("data-checkout-attempt")
 await page.getByRole("link",{name:"Tentar novamente"}).click()
 await expect(page.getByText("Bola de teste").first()).toBeVisible()
 await expect.poll(()=>events.map(e=>e.event)).toContain("checkout_ready")
 await expect.poll(async()=>page.locator("[data-checkout-attempt]").getAttribute("data-checkout-attempt")).not.toBe(first)
 expect(serverLogs().find(e=>e.attemptId===first)).toMatchObject({outcome:"http_error",status:503})
})

test("timeout e resposta inválida têm diagnóstico específico",async({page})=>{
 await diagnostics(page)
 for(const [token,outcome] of [["timeout-checkout","timeout"],["invalid-checkout","invalid_response"],["malformed-checkout","invalid_response"]]){
  await page.goto(`/cart/${token}`)
  await expect(page.getByRole("heading",{name:"Erro ao carregar"})).toBeVisible()
  const attempt=await page.locator("[data-checkout-attempt]").getAttribute("data-checkout-attempt")
  expect(serverLogs().find(e=>e.attemptId===attempt)).toMatchObject({outcome})
 }
})

test("tela paga não gera falso alarme de hidratação",async({page})=>{
 const events=await diagnostics(page)
 await page.clock.install()
 await page.goto("/cart/paid-checkout")
 await expect.poll(()=>events.map(e=>e.event)).toContain("checkout_loaded")
 await page.clock.fastForward(25_000)
 expect(events.map(e=>e.event)).not.toContain("hydration_timeout")
})

test("erro React é relatado sem mensagem sensível e sem promessa de notificação",async({page})=>{
 const events=await diagnostics(page)
 await page.goto("/cart/client-failure")
 await expect.poll(()=>events.map(e=>e.event)).toContain("checkout_ready")
 await page.getByRole("button",{name:"Simular erro React"}).click()
 await expect(page.getByRole("heading",{name:"Algo deu errado"})).toBeVisible()
 await expect(page.getByText(/equipe foi notificada/)).toHaveCount(0)
 await expect.poll(()=>events.map(e=>e.event)).toContain("client_error")
 expect(JSON.stringify(events)).not.toContain("PRIVATE_CUSTOMER_ERROR_DO_NOT_LOG")
})


test("perda de conexão registra apenas eventos limitados e envia na volta",async({page,context})=>{
 const events=await diagnostics(page)
 await page.goto("/cart/offline-checkout")
 await expect.poll(()=>events.map(e=>e.event)).toContain("checkout_ready")
 await context.setOffline(true)
 await expect.poll(()=>page.evaluate(()=>navigator.onLine)).toBe(false)
 await context.setOffline(false)
 await expect.poll(()=>events.map(e=>e.event)).toContain("offline")
 await expect.poll(()=>events.map(e=>e.event)).toContain("recovered_online")
 expect(events.find(e=>e.event==="offline")?.online).toBe(false)
 expect(events.length).toBeLessThanOrEqual(8)
})


test("lojista recebe ação específica para contas lançadas e aviso some após conciliar",async({page})=>{
 await page.route("https://images.example.test/**",route=>route.fulfill({status:403,body:"AccessDenied"}))
 await page.goto("/log-audit")
 await page.getByRole("button",{name:"Receber bloqueio financeiro"}).click()
 await expect(page.getByText(/O ERP bloqueou a edição porque há contas lançadas/)).toBeVisible()
 await page.getByRole("button",{name:"Receber itens confirmados"}).click()
 await expect(page.getByText(/O ERP bloqueou a edição porque há contas lançadas/)).toHaveCount(0)
})


test("navegação sem reload e erros consecutivos mantêm tentativas distintas",async({page})=>{
 const events=await diagnostics(page)
 await page.route("https://images.example.test/**",route=>route.fulfill({status:403,body:"AccessDenied"}))
 await page.goto("/log-audit")
 await page.getByRole("link",{name:"Abrir checkout de teste"}).click()
 await expect.poll(()=>events.map(e=>e.event)).toContain("checkout_ready")
 await page.goto("/cart/unavailable-always")
 await expect.poll(()=>events.filter(e=>e.event==="server_error_screen").length).toBe(1)
 const first=await page.locator("[data-checkout-attempt]").getAttribute("data-checkout-attempt")
 await page.getByRole("link",{name:"Tentar novamente"}).click()
 await expect.poll(()=>events.filter(e=>e.event==="server_error_screen").length).toBe(2)
 const last=events.filter(e=>e.event==="server_error_screen").at(-1)
 expect(last?.attemptId).not.toBe(first)
})

test("erro após hidratação informa categoria e posição sem dados da cliente",async({page})=>{
 const events=await diagnostics(page)
 await page.goto("/cart/private-error-token")
 await expect.poll(()=>events.map(e=>e.event)).toContain("checkout_ready")
 await page.evaluate(()=>{
  window.dispatchEvent(new ErrorEvent("error",{error:new TypeError("Cannot read properties of undefined: cliente@example.com /cart/private-error-token"),filename:location.origin+"/_next/static/chunks/1234-abcd1234.js?token=secret",lineno:1,colno:4321}))
 })
 await expect.poll(()=>events.find(e=>e.event==="javascript_error")).toMatchObject({errorType:"TypeError",errorCode:"property_access",errorSource:"app_chunk",phase:"ready",asset:"1234-abcd1234",line:1,column:4321})
 expect(JSON.stringify(events)).not.toMatch(/cliente@example|private-error-token|secret|Cannot read/)
})

for (const [method,label,card] of [
 ["erp_manual","Pagamento confirmado pela loja",false],
 ["manual","Pagamento confirmado pela loja",false],
 ["card","Visa",true],
 ["credit_card","Visa",true],
 ["debit_card","Cartão de débito",true],
 ["pix","PIX",false],
 ["boleto","Boleto",false],
 ["unknown","Pagamento confirmado",false],
] as const) {
 test(`confirmação de pagamento: ${method}`,async({page})=>{
  const events=await diagnostics(page)
  const errors:string[]=[]
  page.on("pageerror",e=>errors.push(e.message))
  await page.goto(`/cart/paid-method-${method}`)
  await expect(page.getByRole("heading",{name:"Pagamento confirmado!"})).toBeVisible()
  await expect(page.getByText(label,{exact:true})).toBeVisible()
  await expect(page.getByText("•••• 4242",{exact:true})).toHaveCount(card?1:0)
  await expect(page.getByText("auth-test",{exact:true})).toHaveCount(card?1:0)
  if(!card) {
   await expect(page.getByText(/2x de/)).toHaveCount(0)
   await expect(page.getByText("Cartão de crédito",{exact:true})).toHaveCount(0)
  }
  await expect.poll(()=>events.map(e=>e.event)).toContain("checkout_loaded")
  expect(errors).toEqual([])
 })
}

test("divergência de hidratação tem categoria sem transmitir mensagem privada",async({page})=>{
 const events=await diagnostics(page)
 await page.goto("/cart/paid-method-erp_manual")
 await expect.poll(()=>events.map(e=>e.event)).toContain("checkout_loaded")
 await page.evaluate(()=>window.dispatchEvent(new ErrorEvent("error",{
  error:new Error("Minified React error #418; cliente@example.com /cart/private-token"),
  filename:location.origin+"/_next/static/chunks/1234-abcd1234.js",lineno:1,colno:35067,
 })))
 await expect.poll(()=>events.find(e=>e.event==="javascript_error")).toMatchObject({errorCode:"hydration_mismatch",phase:"ready",asset:"1234-abcd1234"})
 expect(JSON.stringify(events)).not.toMatch(/cliente@example|private-token|Minified/)
})
