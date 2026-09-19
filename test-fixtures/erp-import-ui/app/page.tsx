"use client";
import {useState} from 'react';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {ProductFormERPSearch} from "../../../src/components/product/ProductForm/ProductForm.ERPSearch";
export default function Page(){const [client]=useState(()=>new QueryClient()); const [selected,setSelected]=useState<any>(null); return <QueryClientProvider client={client}><ProductFormERPSearch integrationId="audit-integration" onSelect={setSelected}/><output data-testid="selected">{selected?.id||''}</output></QueryClientProvider>}
