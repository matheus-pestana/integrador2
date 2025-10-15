"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { MOCK_BAR_CHART_DATA, MOCK_SCATTER_DATA } from "@/lib/constants";

const chartConfig = {
  size: {
    label: "Size",
  },
  'High-Value': {
    label: 'High-Value',
    color: 'hsl(var(--chart-1))',
  },
  'New Shoppers': {
    label: 'New Shoppers',
    color: 'hsl(var(--chart-2))',
  },
  'Budget Spenders': {
    label: 'Budget Spenders',
    color: 'hsl(var(--chart-3))',
  },
  'At-Risk': {
    label: 'At-Risk',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

export default function DashboardCharts() {
  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Customer Segments</CardTitle>
                <CardDescription>Size of each identified customer segment.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <ResponsiveContainer>
                        <BarChart data={MOCK_BAR_CHART_DATA} margin={{ top: 20 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar dataKey="size" radius={4} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Cluster Visualization</CardTitle>
                <CardDescription>Purchase frequency vs. average purchase value.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <ResponsiveContainer>
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid />
                            <XAxis type="number" dataKey="purchase_frequency" name="Purchase Frequency" unit="x" />
                            <YAxis type="number" dataKey="avg_purchase_value" name="Avg Purchase Value" unit="$" domain={['dataMin - 10', 'dataMax + 10']} />
                            <ZAxis type="category" dataKey="cluster" name="Segment" />
                            <ChartTooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
                            <Legend />
                            <Scatter name="High-Value" data={MOCK_SCATTER_DATA.filter(d => d.cluster === 'High-Value')} fill="var(--color-chart-1)" />
                            <Scatter name="New Shoppers" data={MOCK_SCATTER_DATA.filter(d => d.cluster === 'New Shoppers')} fill="var(--color-chart-2)" />
                            <Scatter name="Budget Spenders" data={MOCK_SCATTER_DATA.filter(d => d.cluster === 'Budget Spenders')} fill="var(--color-chart-3)" />
                            <Scatter name="At-Risk" data={MOCK_SCATTER_DATA.filter(d => d.cluster === 'At-Risk')} fill="var(--color-chart-4)" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    </div>
  );
}
