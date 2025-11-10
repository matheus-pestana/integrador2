"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis, Cell, PieChart, Pie, Label as RechartsLabel } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { MOCK_BAR_CHART_DATA, MOCK_SCATTER_DATA } from "../lib/constants";
import { useSegmentation } from "../context/segmentation-context";
import { useMemo } from "react";
interface BarChartData {
  name: string;
  size: number;
  fill: string;
}
interface ScatterChartData {
  purchase_frequency: number;
  avg_purchase_value: number;
  cluster: string;
  fill: string;
}

const chartConfigBase: ChartConfig = {
  size: {
    label: "Tamanho",
  },
  'Alto Valor': {
    label: 'Alto Valor',
    color: 'hsl(var(--chart-1))',
  },
  'Novos Clientes': {
    label: 'Novos Clientes',
    color: 'hsl(var(--chart-2))',
  },
  'Clientes Econômicos': {
    label: 'Clientes Econômicos',
    color: 'hsl(var(--chart-3))',
  },
  'Em Risco': {
    label: 'Em Risco',
    color: 'hsl(var(--chart-4))',
  },
  'Segmento 5': {
    label: 'Segmento 5',
    color: 'hsl(var(--chart-5))',
  }
};


export default function DashboardCharts() {
  const { analysis } = useSegmentation();

  const { chartConfig, barChartData, scatterChartData, scatterDomains } = useMemo(() => {
    if (!analysis?.segments?.length) {
      return {
        chartConfig: chartConfigBase,
        barChartData: MOCK_BAR_CHART_DATA,
        scatterChartData: MOCK_SCATTER_DATA,
        scatterDomains: {
          x: [0, 'dataMax'],
          y: ['dataMin - 10', 'dataMax + 10']
        }
      };
    }

    const newChartConfig: ChartConfig = { size: { label: "Tamanho" } };
    // CORREÇÃO: Tipagem explícita para evitar 'any[]'
    const newBarChartData: BarChartData[] = [];
    const newScatterChartData: ScatterChartData[] = [];

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    analysis.segments.forEach((segment, i) => {
      const chartColorKey = `chart-${(i % 5) + 1}` as '1' | '2' | '3' | '4' | '5';
      const color = `hsl(var(--${chartColorKey}))`;

      newChartConfig[segment.name] = {
        label: segment.name,
        color: color,
      };

      newBarChartData.push({
        name: segment.name,
        size: segment.size,
        fill: color,
      });

      // Para o gráfico de dispersão, gera dados aleatórios em torno da média do segmento
      for (let j = 0; j < segment.size; j++) {
        const freq = segment.purchase_frequency + (Math.random() - 0.5) * (segment.purchase_frequency * 0.8);
        const val = segment.avg_purchase_value + (Math.random() - 0.5) * (segment.avg_purchase_value * 0.8);
        minX = Math.min(minX, freq);
        maxX = Math.max(maxX, freq);
        minY = Math.min(minY, val);
        maxY = Math.max(maxY, val);
        newScatterChartData.push({
          purchase_frequency: freq,
          avg_purchase_value: val,
          cluster: segment.name,
          fill: color
        });
      }
    });

    const xPadding = (maxX - minX) * 0.1;
    const yPadding = (maxY - minY) * 0.1;

    return {
      chartConfig: newChartConfig,
      barChartData: newBarChartData,
      scatterChartData: newScatterChartData,
      scatterDomains: {
        x: [Math.max(0, minX - xPadding), maxX + xPadding],
        y: [Math.max(0, minY - yPadding), maxY + yPadding],
      }
    };

  }, [analysis]);


  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-headline">Segmentos de Clientes</CardTitle>
          <CardDescription>Tamanho de cada segmento de cliente identificado.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer>
              <BarChart data={barChartData} margin={{ top: 20 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} tick={barChartData.length > 4 ? false : true} />
                <YAxis />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                
                {/* CORREÇÃO: Adicionado payload personalizado para a legenda */}
                <Legend 
                  payload={barChartData.map((item) => ({
                    id: item.name,
                    type: "square",
                    value: item.name,
                    color: item.fill,
                  }))}
                />
                
                <Bar dataKey="size" radius={4}>
                  {barChartData.map((entry) => (
                    // CORREÇÃO: Removido 'QP' 
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-headline">Visualização dos Clusters</CardTitle>
          <CardDescription>Frequência de compra vs. valor médio de compra.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="purchase_frequency" name="Frequência de Compra" unit="x" domain={scatterDomains.x} />
                <YAxis type="number" dataKey="avg_purchase_value" name="Valor Médio da Compra" unit="R$" domain={scatterDomains.y} />
                <ZAxis type="category" dataKey="cluster" name="Segmento" />
                <ChartTooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
                <Legend />
                {Object.keys(chartConfig).filter(key => key !== 'size').map((segmentName) => (
                  <Scatter
                    key={segmentName}
                    name={segmentName}
                    data={scatterChartData.filter(d => d.cluster === segmentName)}
                    fill={chartConfig[segmentName]?.color}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}