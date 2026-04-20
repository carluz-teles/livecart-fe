"use client"

import { Search, MoreHorizontal, ShoppingBag, Users, TrendingUp } from "lucide-react"

import { formatCurrency, formatDate } from "@/lib/format"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CustomerFilters } from "@/components/shared/Filters"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatsCard } from "@/components/shared/StatsCard"
import { useListParams } from "@/hooks/shared/useListParams"
import { useCustomers, useCustomerStats } from "@/hooks/customer"
import type { CustomerFilters as CustomerFiltersType } from "@/types/customer.types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

function getInitials(handle: string) {
  return handle.slice(0, 2).toUpperCase()
}

export default function CustomersPage() {
  const {
    search,
    setSearch,
    filters,
    setFilters,
    params,
  } = useListParams<CustomerFiltersType>()

  // Fetch customers from API
  const { data, isLoading, error } = useCustomers(params)
  // Fetch stats from API
  const { data: stats, isLoading: statsLoading } = useCustomerStats()

  const customers = data?.data ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clientes"
        description="Gerencie seus clientes e visualize o histórico de compras"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total de Clientes"
          value={stats?.totalCustomers ?? 0}
          description="Clientes cadastrados"
          icon={Users}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Clientes Ativos"
          value={stats?.activeCustomers ?? 0}
          description="Compraram nos últimos 30 dias"
          icon={ShoppingBag}
          isLoading={statsLoading}
          variant="success"
        />
        <StatsCard
          title="Gasto Médio"
          value={formatCurrency(stats?.avgSpentPerCustomer ?? 0)}
          description="Média por cliente"
          icon={TrendingUp}
          isLoading={statsLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os seus clientes cadastrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por @handle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <CustomerFilters filters={filters} onChange={setFilters} />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-center">Pedidos</TableHead>
                  <TableHead className="text-right">Total Gasto</TableHead>
                  <TableHead>Primeiro Pedido</TableHead>
                  <TableHead>Último Pedido</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-destructive">
                      Erro ao carregar clientes. Tente novamente.
                    </TableCell>
                  </TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-xs">
                              {getInitials(customer.handle)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">@{customer.handle}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                          {customer.totalOrders}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(customer.totalSpent)}
                      </TableCell>
                      <TableCell>{formatDate(customer.firstOrderAt)}</TableCell>
                      <TableCell>{formatDate(customer.lastOrderAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Ver pedidos</DropdownMenuItem>
                            <DropdownMenuItem>Enviar mensagem</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
