"use client";

import { useState, useTransition, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSegmentationInsights, type SegmentationState } from '@/lib/actions';
import { Loader2, Wand2, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SegmentationPage() {
    const [state, setState] = useState<SegmentationState>({});
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [csvData, setCsvData] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setCsvData(text);
                setFileName(file.name);
            };
            reader.readAsText(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
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

        startTransition(async () => {
            const result = await getSegmentationInsights(csvData);
            if(result.message !== 'success') {
                toast({
                    variant: 'destructive',
                    title: 'Falha na análise',
                    description: result.message,
                });
            }
            setState(result);
        });
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Market Segmentation</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Analise os dados do cliente para identificar automaticamente segmentos de mercado distintos.
                    Carregue um arquivo .csv para executar uma análise e obter insights sobre sua base de clientes.
                </p>
            </div>

            <Card className="max-w-4xl">
                <CardHeader>
                    <CardTitle>Executar Análise de Segmentação</CardTitle>
                    <CardDescription>Use IA para descobrir os principais atributos e necessidades de diferentes grupos de clientes a partir dos seus dados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-background/50 space-y-4">
                        <Wand2 className="h-12 w-12 text-primary" />
                        
                        <input
                            type="file"
                            ref={fileInputRef}
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

            {isPending && (
                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Analisando Segmentos...</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                        <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-3/4 animate-pulse mt-6"></div>
                        <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                    </CardContent>
                </Card>
            )}

            {state.insights && !isPending && (
                 <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle className="font-headline">Insights de Segmentação</CardTitle>
                        <CardDescription>Análise gerada por IA de seus segmentos de clientes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-sans p-4 bg-muted/50 rounded-lg">
                            {state.insights}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
