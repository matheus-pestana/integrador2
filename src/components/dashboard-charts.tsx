"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { MOCK_BAR_CHART_DATA, MOCK_SCATTER_DATA } from "@/lib/constants";
import { useSegmentation } from "@/context/segmentation-context";
import { useMemo } from "react";

const chartConfigBase: ChartConfig = {
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
  'Segment 5': {
    label: 'Segment 5',
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
    
    const newChartConfig: ChartConfig = { size: { label: "Size" } };
    const newBarChartData = [];
    const newScatterChartData = [];

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
      
      // For scatter, generate some random data around the segment's average
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
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Customer Segments</CardTitle>
                <CardDescription>Size of each identified customer segment.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <ResponsiveContainer>
                        <BarChart data={barChartData} margin={{ top: 20 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} tick={barChartData.length > 4 ? false : true} />
                            <YAxis />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="size" radius={4}>
                                {barChartData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.fill} />
                                ))}
                            </Bar>
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
                            <XAxis type="number" dataKey="purchase_frequency" name="Purchase Frequency" unit="x" domain={scatterDomains.x} />
                            <YAxis type="number" dataKey="avg_purchase_value" name="Avg Purchase Value" unit="$" domain={scatterDomains.y} />
                            <ZAxis type="category" dataKey="cluster" name="Segment" />
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
