
"use client";

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSegmentationInsights } from '@/lib/actions';
import { Loader2, Wand2, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSegmentation } from '@/context/segmentation-context';
import DashboardCharts from '@/components/dashboard-charts';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ResponsiveContainer, PieChart, Pie, Cell, Label as RechartsLabel, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { useMemo } from 'react';
import type { ChartConfig } from '@/components/ui/chart';


export default function SegmentationPage() {
    const { analysis, setAnalysis } = useSegmentation();
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [csvData, setCsvData] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);
    const [numClusters, setNumClusters] = useState(3);

    const [dataTreatment, setDataTreatment] = useState({
        normalize: true,
        excludeNulls: true,
        groupCategories: false,
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                // Limit the amount of data we process
                const lines = text.split('\n');
                const header = lines[0];
                const sample = lines.slice(1, 11).join('\n'); // Header + 10 rows
                setCsvData(`${header}\n${sample}`);
                setFileName(file.name);
            };
            reader.readAsText(file);
        }
    };

    const handleUploadClick = () => {
        fileInput?.click();
    };

    const handleAnalysis = () => {
        if (!csvData) {
            toast({
                variant: 'destructive',
                title: 'Nenhum arquivo selecionado',
                description: 'Por favor, carregue um arquivo .csv para gerar insights.',
            });
            return;
        }

        const numberOfClusters = numClusters;

        startTransition(async () => {
            const result = await getSegmentationInsights(csvData, dataTreatment, numberOfClusters);
            if(result.message === 'success' && result.analysis) {
                setAnalysis(result.analysis);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Falha na análise',
                    description: result.message,
                });
                setAnalysis(null);
            }
        });
    };

    const { chartConfig, pieChartData, totalCustomers } = useMemo(() => {
        if (!analysis?.segments?.length) {
            return {
                chartConfig: {},
                pieChartData: [],
                totalCustomers: 0,
            };
        }

        const newChartConfig: ChartConfig = {};
        const newPieChartData = [];
        let newTotalCustomers = 0;

        analysis.segments.forEach((segment, i) => {
            const chartColorKey = `chart-${(i % 5) + 1}` as '1' | '2' | '3' | '4' | '5';
            const color = `hsl(var(--${chartColorKey}))`;

            newChartConfig[segment.name] = {
                label: segment.name,
                color: color,
            };

            newPieChartData.push({
                name: segment.name,
                value: segment.size,
                fill: color,
            });
            newTotalCustomers += segment.size;
        });

        return {
            chartConfig,
            pieChartData: newPieChartData,
            totalCustomers: newTotalCustomers,
        };
    }, [analysis]);

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Market Segmentation</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Analise os dados do cliente para identificar automaticamente segmentos de mercado distintos.
                    Carregue um arquivo .csv para executar uma análise e obter insights sobre sua base de clientes.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 grid grid-cols-1 gap-8 items-start">
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Treatment</CardTitle>
                            <CardDescription>Configure data pre-processing.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="normalize" checked={dataTreatment.normalize} onCheckedChange={(checked) => setDataTreatment(prev => ({...prev, normalize: !!checked}))} />
                                <Label htmlFor="normalize">Normalize Data</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="exclude-nulls" checked={dataTreatment.excludeNulls} onCheckedChange={(checked) => setDataTreatment(prev => ({...prev, excludeNulls: !!checked}))} />
                                <Label htmlFor="exclude-nulls">Exclude Nulls</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="group-categories" checked={dataTreatment.groupCategories} onCheckedChange={(checked) => setDataTreatment(prev => ({...prev, groupCategories: !!checked}))} />
                                <Label htmlFor="group-categories">Group Categories</Label>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Clustering</CardTitle>
                            <CardDescription>Configure the clustering algorithm.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="clustering-settings">Settings</Label>
                                <Select defaultValue="kmeans">
                                    <SelectTrigger id="clustering-settings">
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kmeans">K-Means</SelectItem>
                                        <SelectItem value="dbscan">DBSCAN</SelectItem>
                                        <SelectItem value="hierarchical">Hierarchical</SelectItem>
                                        <SelectItem value="gmm">Gaussian Mixture</SelectItem>
                                        <SelectItem value="som">Self-Organizing Maps</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="num-clusters">Number of Clusters</Label>
                                <Input id="num-clusters" type="number" value={numClusters} onChange={(e) => setNumClusters(Math.max(1, parseInt(e.target.value, 10) || 1))} min="1" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="distance-metric">Distance Metric</Label>
                                <Select defaultValue="euclidean">
                                    <SelectTrigger id="distance-metric">
                                        <SelectValue placeholder="Select metric" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="euclidean">Euclidean</SelectItem>
                                        <SelectItem value="manhattan">Manhattan</SelectItem>
                                        <SelectItem value="cosine">Cosine</SelectItem>
                                        <SelectItem value="minkowski">Minkowski</SelectItem>
                                        <SelectItem value="chebyshev">Chebyshev</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Executar Análise de Segmentação</CardTitle>
                        <CardDescription>Use IA para descobrir os principais atributos e necessidades de diferentes grupos de clientes a partir dos seus dados.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-background/50 space-y-4">
                            <Wand2 className="h-12 w-12 text-primary" />
                            
                            <input
                                type="file"
                                ref={setFileInput}
                                onChange={handleFileChange}
                                accept=".csv"
                                className="hidden"
                            />
                            
                            <Button onClick={handleUploadClick} variant="outline">
                                <Upload className="mr-2 h-4 w-4" />
                                Carregar arquivo .csv
                            </Button>

                            {fileName && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>{fileName}</span>
                                </div>
                            )}

                            <Button onClick={handleAnalysis} disabled={isPending || !csvData}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                Gerar Insights
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {isPending && (
                <div className="grid md:grid-cols-2 gap-6 mt-8 animate-pulse">
                    <Card>
                        <CardHeader>
                            <div className="h-6 bg-muted rounded w-3/4"></div>
                            <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] bg-muted rounded-md"></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="h-6 bg-muted rounded w-3/4"></div>
                            <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] bg-muted rounded-md"></div>
                        </CardContent>
                    </Card>
                </div>
            )}
            
            <div className="grid gap-6 mt-8">
                {analysis?.textualInsights && !isPending && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Insights de Segmentação</CardTitle>
                            <CardDescription>Análise gerada por IA de seus segmentos de clientes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-sans p-4 bg-muted/50 rounded-lg">
                                {analysis.textualInsights}
                            </div>
                        </CardContent>
                    </Card>
                )}
                
                {analysis && !isPending && (
                    <>
                        <DashboardCharts />
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Segment Distribution</CardTitle>
                                <CardDescription>Percentage distribution of customer segments.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center">
                                <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full max-h-[300px] pb-0">
                                    <ResponsiveContainer>
                                    <PieChart>
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel />}
                                        />
                                        <Pie
                                            data={pieChartData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={60}
                                            outerRadius={80}
                                            strokeWidth={5}
                                        >
                                            <RechartsLabel
                                                content={({ viewBox }) => {
                                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                    return (
                                                        <text
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        >
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={viewBox.cy}
                                                            className="text-3xl font-bold"
                                                        >
                                                            {totalCustomers.toLocaleString()}
                                                        </tspan>
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={(viewBox.cy || 0) + 24}
                                                            className="text-muted-foreground"
                                                        >
                                                            Customers
                                                        </tspan>
                                                        </text>
                                                    )
                                                    }
                                                }}
                                            />
                                            {pieChartData.map((entry) => (
                                                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <ChartLegend
                                            content={<ChartLegendContent nameKey="name" className="flex-wrap" />}
                                            className="-mt-4"
                                        />
                                    </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}
