import { expect, test } from '@playwright/test'
import { apiClient } from '../src/services/api/client'
import { integrationService } from '../src/services/api/integration.service'

const originalFetch=globalThis.fetch
test.afterEach(()=>{globalThis.fetch=originalFetch})

test('AUDIT: timeout cobre também o corpo da resposta',async()=>{
 let body!:ReadableStreamDefaultController<Uint8Array>
 let aborted=false
 globalThis.fetch=async(_,init)=>{
  init?.signal?.addEventListener('abort',()=>{aborted=true;body.error(new DOMException('Timeout','AbortError'))})
  return new Response(new ReadableStream({start(c){body=c}}),{status:200})
 }
 const request=apiClient.get('/audit','token',undefined,20)
 let settled=false
 const tracked=request.then(()=>{settled=true},()=>{settled=true})
 await new Promise(resolve=>setTimeout(resolve,80))
 const observed={aborted,settled}
 if (!aborted) { body.enqueue(new TextEncoder().encode('{"data":{}}'));body.close() };await tracked
 expect(observed,'BUG: headers cancelam o timer enquanto o corpo continua pendente').toEqual({aborted:true,settled:true})
})

test('AUDIT: cancelar após os headers interrompe leitura do corpo',async()=>{
 let body!:ReadableStreamDefaultController<Uint8Array>;let wireSignal!:AbortSignal
 globalThis.fetch=async(_,init)=>{
  wireSignal=init!.signal!;wireSignal.addEventListener('abort',()=>body.error(new DOMException('Cancelled','AbortError')))
  return new Response(new ReadableStream({start(c){body=c}}),{status:200})
 }
 const abort=new AbortController()
 const request=integrationService.searchProducts('store','integration','Natal','token',abort.signal)
 await new Promise(resolve=>setTimeout(resolve,5));abort.abort()
 const observed=wireSignal.aborted
 if (!observed) { body.enqueue(new TextEncoder().encode('{"data":{"products":[]}}'));body.close() };await request.catch(()=>undefined)
 expect(observed,'BUG: cancelamento deixa de propagar após headers').toBe(true)
})

test('AUDIT: confirmar importação aguarda mais de dez segundos',async()=>{
 globalThis.fetch=async(_,init)=>new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>resolve(new Response('{"data":{"imported":[{"externalId":"v1"}]}}',{status:201})),10_200)
  init!.signal!.addEventListener('abort',()=>{clearTimeout(timer);reject(new DOMException('Timeout','AbortError'))})
 })
 const result=await integrationService.importProduct('store','integration','parent',['v1'],'token')
 expect(result.imported).toHaveLength(1)
})

const preview={id:'p1',name:'Vela Audit',sku:'AUDIT',price:1000,stock:0,active:true,detailsPending:true}
async function fixture(page:any,parent=false,withoutAttributes=false){
 const errors:string[]=[];page.on('pageerror',(e:Error)=>errors.push(e.message))
 await page.route('**/api/v1/**',async(route:any)=>{
  const url=new URL(route.request().url())
  const data=url.searchParams.has('search')?{products:[{...preview,isParent:parent}],totalCount:1,hasMore:false}:
   {...preview,detailsPending:false,stock:3,isParent:parent,variants:parent?[{id:'v1',sku:'BLUE',price:1000,stock:3,active:true,...(!withoutAttributes?{attributes:{Cor:'Azul'}}:{})}]:undefined}
  await route.fulfill({json:{data}})
 })
 await page.goto('/')
 return errors
}
test('AUDIT controle: UI encontra e seleciona um produto simples',async({page})=>{
 const errors=await fixture(page)
 await page.getByPlaceholder('Buscar por nome, SKU ou código de barras...').fill('7893979655073')
 await page.getByRole('button',{name:/Vela Audit/}).click()
 await page.getByRole('button',{name:'Criar Produto',exact:true}).click()
 await expect(page.getByTestId('selected')).toHaveText('p1')
 expect(errors).toEqual([])
})
test('AUDIT: variante sem atributos não quebra o seletor',async({page})=>{
 const errors=await fixture(page,true,true)
 await page.getByPlaceholder('Buscar por nome, SKU ou código de barras...').fill('Caneca')
 await page.getByRole('button',{name:/Vela Audit/}).click()
 await page.getByRole('button',{name:'Escolher variantes',exact:true}).click()
 await page.waitForTimeout(200)
 expect(errors,'BUG: atributos opcionais do backend tratados como obrigatórios no componente').toEqual([])
 await expect(page.getByRole('dialog')).toBeVisible()
})
test('AUDIT: mudar termo impede confirmar resultado da busca anterior',async({page})=>{
 await fixture(page)
 await page.clock.install()
 await page.getByPlaceholder('Buscar por nome, SKU ou código de barras...').fill('Vela')
 await page.getByRole('button',{name:/Vela Audit/}).waitFor()
 await page.clock.pauseAt(new Date(Date.now()+1000))
 await page.getByPlaceholder('Buscar por nome, SKU ou código de barras...').fill('Outro produto')
 const stale=await page.getByRole('button',{name:/Vela Audit/}).count()
 if(stale){
  const loaded=page.waitForResponse((r)=>r.url().endsWith('/products/p1'))
  await page.getByRole('button',{name:/Vela Audit/}).click({force:true})
  await loaded
  await page.clock.runFor(10)
  await page.getByRole('button',{name:'Criar Produto',exact:true}).click({force:true})
  await page.clock.runFor(10)
 }
 expect(await page.getByTestId('selected').textContent(),'BUG: confirmou resultado antigo após mudar a busca').toBe('')
})

test('importa sete variantes em etapas e preserva as já cadastradas', async ({ page }) => {
 const calls:string[][]=[]
 const variants=Array.from({length:8},(_,i)=>({id:`v${i}`,sku:`SKU${i}`,active:true,price:1000,stock:0,stockKnown:false,alreadyImported:i===0,attributes:{Cor:`Cor ${i}`}}))
 await page.route('**/api/v1/**',async route=>{
  const request=route.request();const url=new URL(request.url())
  if(request.method()==='POST'){
   const ids=request.postDataJSON().variantIds as string[];calls.push(ids)
   for(const v of variants) if(ids.includes(v.id)) v.alreadyImported=true
   await route.fulfill({status:201,json:{data:{isParent:true,groupId:'group',imported:ids.map(externalId=>({externalId}))}}});return
  }
  await route.fulfill({json:{data:url.searchParams.has('search')?{products:[{...preview,isParent:true}],totalCount:1}:{...preview,detailsPending:false,isParent:true,variants}}})
 })
 await page.goto('/')
 await page.getByPlaceholder('Buscar por nome, SKU ou código de barras...').fill('Caneca')
 await page.getByRole('button',{name:/Vela Audit/}).click()
 await page.getByRole('button',{name:'Escolher variantes',exact:true}).click()
 await expect(page.getByRole('checkbox',{name:'Selecionar variante SKU0',exact:true})).toBeDisabled()
 await page.getByRole('button',{name:'Importar 7 variantes',exact:true}).click()
 await expect(page.getByRole('dialog')).not.toBeVisible()
 expect(calls).toEqual([['v1','v2','v3','v4','v5'],['v6','v7']])
})

test('falha na segunda etapa permite retomar somente as variantes restantes', async ({ page }) => {
 const calls:string[][]=[];let failed=false
 const variants=Array.from({length:7},(_,i)=>({id:`v${i}`,sku:`SKU${i}`,active:true,price:1000,stock:0,stockKnown:false,alreadyImported:false,attributes:{Cor:`Cor ${i}`}}))
 await page.route('**/api/v1/**',async route=>{
  const request=route.request();const url=new URL(request.url())
  if(request.method()==='POST'){
   const ids=request.postDataJSON().variantIds as string[];calls.push(ids)
   if(calls.length===2){failed=true;await route.fulfill({status:503,json:{reason:'ERP_THROTTLED',error:'ERP ocupado, tente novamente'}});return}
   for(const v of variants) if(ids.includes(v.id)) v.alreadyImported=true
   await route.fulfill({status:201,json:{data:{isParent:true,groupId:'group',imported:ids.map(externalId=>({externalId}))}}});return
  }
  await route.fulfill({json:{data:url.searchParams.has('search')?{products:[{...preview,isParent:true}],totalCount:1}:{...preview,detailsPending:false,isParent:true,variants}}})
 })
 await page.goto('/')
 await page.getByPlaceholder('Buscar por nome, SKU ou código de barras...').fill('Caneca')
 await page.getByRole('button',{name:/Vela Audit/}).click()
 await page.getByRole('button',{name:'Escolher variantes',exact:true}).click()
 await page.getByRole('button',{name:'Importar 7 variantes',exact:true}).click()
 await expect(page.getByRole('button',{name:'Importar 2 variantes',exact:true})).toBeEnabled()
 expect(failed).toBe(true)
 await page.getByRole('button',{name:'Importar 2 variantes',exact:true}).click()
 await expect(page.getByRole('dialog')).not.toBeVisible()
 expect(calls).toEqual([['v0','v1','v2','v3','v4'],['v5','v6'],['v5','v6']])
})
