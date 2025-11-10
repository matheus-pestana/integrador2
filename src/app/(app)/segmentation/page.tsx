"use client";

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSegmentationInsights } from '@/lib/actions';
import { Loader2, Wand2, Upload, FileText, Info } from 'lucide-react'; // Usando Info para destaque
import { useToast } from '@/hooks/use-toast';
import { useSegmentation } from '@/context/segmentation-context';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import DashboardCharts from '@/components/dashboard-charts';

// Dicionário com as explicações simplificadas
const algoDescriptions: Record<string, string> = {
    kmeans: "O método mais rápido e comum. Funciona melhor quando você quer encontrar grupos de tamanhos parecidos e bem definidos.",
    dbscan: "Ótimo para dados 'bagunçados'. Ele encontra grupos de qualquer formato e é inteligente para ignorar clientes que não se encaixam em nenhum perfil (ruído).",
    hierarchical: "Cria uma 'árvore genealógica' dos seus clientes, mostrando como pequenos grupos podem ser juntados para formar grupos maiores.",
    gmm: "Mais flexível que o K-Means. É útil quando os perfis dos clientes se misturam um pouco e não têm fronteiras tão claras.",
    som: "Usa um tipo de inteligência artificial (redes neurais) para criar um mapa visual, colocando clientes parecidos próximos uns dos outros."
};

export default function SegmentationPage() {
    const { analysis, setAnalysis } = useSegmentation();
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [csvData, setCsvData] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);
    const [numClusters, setNumClusters] = useState(3);
    // Novo estado para controlar o algoritmo selecionado
    const [selectedAlgo, setSelectedAlgo] = useState("kmeans");

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
                const lines = text.split('\n');
                const header = lines[0];
                const sample = lines.slice(1, 11).join('\n');
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

        // (Nota: Você precisará passar o 'selectedAlgo' para a função getSegmentationInsights se o backend suportar isso no futuro.
        // Por enquanto, mantive como estava, usando apenas numClusters conforme sua implementação original)
        startTransition(async () => {
            const result = await getSegmentationInsights(csvData, dataTreatment, numClusters);
            if(result.message === 'success' && result.analysis) {
                setAnalysis(result.analysis);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Falha na análise',
                    description: result.errorMessage,
                });
                setAnalysis(null);
            }
        });
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Segmentação de Mercado</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Descubra grupos de clientes automaticamente a partir dos seus dados.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 grid grid-cols-1 gap-8 items-start">
                    <Card>
                        <CardHeader>
                            <CardTitle>Limpeza de Dados</CardTitle>
                            <CardDescription>Prepare seus dados para obter melhores resultados.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="normalize" checked={dataTreatment.normalize} onCheckedChange={(checked) => setDataTreatment(prev => ({...prev, normalize: !!checked}))} />
                                <Label htmlFor="normalize" className="cursor-pointer">Normalizar Dados (Recomendado)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="exclude-nulls" checked={dataTreatment.excludeNulls} onCheckedChange={(checked) => setDataTreatment(prev => ({...prev, excludeNulls: !!checked}))} />
                                <Label htmlFor="exclude-nulls" className="cursor-pointer">Ignorar linhas com dados faltando</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="group-categories" checked={dataTreatment.groupCategories} onCheckedChange={(checked) => setDataTreatment(prev => ({...prev, groupCategories: !!checked}))} />
                                <Label htmlFor="group-categories" className="cursor-pointer">Agrupar categorias similares</Label>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Configuração da IA</CardTitle>
                            <CardDescription>Ajuste como a IA deve agrupar seus clientes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="clustering-settings">Método de Agrupamento</Label>
                                <Select 
                                    defaultValue="kmeans" 
                                    onValueChange={setSelectedAlgo} // Atualiza o estado quando muda
                                >
                                    <SelectTrigger id="clustering-settings">
                                        <SelectValue placeholder="Selecione o método" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kmeans">K-Means (Padrão)</SelectItem>
                                        <SelectItem value="dbscan">DBSCAN</SelectItem>
                                        <SelectItem value="hierarchical">Hierárquico</SelectItem>
                                        <SelectItem value="gmm">Gaussian Mixture</SelectItem>
                                        <SelectItem value="som">Self-Organizing Maps</SelectItem>
                                    </SelectContent>
                                </Select>
                                
                                {/* Caixa explicativa persistente - Resolve o problema visual e melhora a UX */}
                                <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground flex gap-2 items-start">
                                    <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                                    <p>{algoDescriptions[selectedAlgo]}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="num-clusters">Quantos grupos você quer encontrar?</Label>
                                <Input id="num-clusters" type="number" value={numClusters} onChange={(e) => setNumClusters(Math.max(1, parseInt(e.target.value, 10) || 1))} min="1" />
                                <p className="text-xs text-muted-foreground">A IA tentará dividir seus clientes neste número de segmentos.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Enviar Arquivo e Analisar</CardTitle>
                        <CardDescription>Envie sua planilha de clientes (.csv) para a IA analisar.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-background/50 space-y-6 min-h-[300px] text-center">
                             <div className="p-4 bg-primary/10 rounded-full">
                                <Wand2 className="h-10 w-10 text-primary" />
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">Comece sua análise</h3>
                                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                                    Seus dados serão processados de forma segura para gerar insights valiosos sobre quem são seus clientes.
                                </p>
                            </div>

                            <input
                                type="file"
                                ref={setFileInput}
                                onChange={handleFileChange}
                                accept=".csv"
                                className="hidden"
                            />
                            
                            {!csvData ? (
                                <Button onClick={handleUploadClick} size="lg" className="font-semibold">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Selecionar Arquivo CSV
                                </Button>
                            ) : (
                                <div className="flex flex-col items-center space-y-4 w-full max-w-xs">
                                    <div className="flex items-center gap-3 p-3 bg-muted/80 border rounded-md w-full text-left">
                                        <FileText className="h-8 w-8 text-primary shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{fileName}</p>
                                            <p className="text-xs text-muted-foreground">Pronto para análise</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full">
                                        <Button onClick={handleUploadClick} variant="outline" className="flex-1">
                                            Trocar
                                        </Button>
                                        <Button onClick={handleAnalysis} disabled={isPending} className="flex-1">
                                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            {isPending ? 'Analisando...' : 'Gerar Insights'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ... (resto do componente para exibir resultados permanece igual) */}
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
                            <CardTitle className="font-headline">Resultados da Análise</CardTitle>
                            <CardDescription>O que a IA descobriu sobre seus segmentos de clientes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-sans p-6 bg-muted/30 border rounded-lg">
                                {analysis.textualInsights}
                            </div>
                        </CardContent>
                    </Card>
                )}
                
                {analysis && !isPending && (
                    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                        <DashboardCharts />
                    </div>
                )}
            </div>
        </div>
    );
}