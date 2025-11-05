"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Activity, DollarSign } from "lucide-react";
import DashboardCharts from "@/components/dashboard-charts";
import { useSegmentation } from "@/context/segmentation-context";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { analysis } = useSegmentation();
  const [totalCustomers, setTotalCustomers] = useState(8231);
  const [avgPurchaseValue, setAvgPurchaseValue] = useState(98.65);

  useEffect(() => {
    if (analysis?.segments) {
      const newTotalCustomers = analysis.segments.reduce((acc, segment) => acc + segment.size, 0);
      setTotalCustomers(newTotalCustomers);

      const totalValue = analysis.segments.reduce((acc, s) => acc + (s.avg_purchase_value * s.size), 0);
      const newAvgPurchaseValue = newTotalCustomers > 0 ? totalValue / newTotalCustomers : 0;
      setAvgPurchaseValue(newAvgPurchaseValue);
    }
  }, [analysis]);


  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Uma visão geral dos seus dados de segmentação de clientes.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              {analysis ? "Da última análise" : "+5,1% do último mês"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Segmentos Identificados
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis?.segments?.length ?? 4}</div>
            <p className="text-xs text-muted-foreground">
              {analysis ? "Baseado na última análise" : "Baseado em dados de mock"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Médio da Compra</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {avgPurchaseValue.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground">
              {analysis ? "Da última análise" : "-1,2% do último mês"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Engajamento</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">62,3%</div>
            <p className="text-xs text-muted-foreground">
              +8,7% do último mês
            </p>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts />
    </div>
  );
}