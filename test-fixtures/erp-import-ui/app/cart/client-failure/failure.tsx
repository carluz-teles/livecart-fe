"use client"
import { useState } from "react"
import { useCheckoutDiagnostics } from "@/hooks/checkout/useCheckoutDiagnostics"
export default function Failure(){
 useCheckoutDiagnostics()
 const [failed,setFailed]=useState(false)
 if(failed) throw new Error("PRIVATE_CUSTOMER_ERROR_DO_NOT_LOG")
 return <button onClick={()=>setFailed(true)}>Simular erro React</button>
}
