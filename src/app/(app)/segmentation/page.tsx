"use client";

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSegmentationInsights, type SegmentationState } from '@/lib/actions';
import { MOCK_CLUSTER_DATA } from '@/lib/constants';
import { Loader2, Wand2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function SegmentationPage() {
    const [state, setState] = useState<SegmentationState>({});
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleAnalysis = () => {
        startTransition(async () => {
            const result = await getSegmentationInsights(JSON.stringify(MOCK_CLUSTER_DATA));
            if(result.message !== 'success') {
                toast({
                    variant: 'destructive',
                    title: 'Analysis Failed',
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
                    Analyze customer data to automatically identify distinct market segments.
                    Click the button below to run an analysis on sample data and gain insights into your customer base.
                </p>
            </div>

            <Card className="max-w-4xl">
                <CardHeader>
                    <CardTitle>Run Segmentation Analysis</CardTitle>
                    <CardDescription>Use AI to discover key attributes and needs of different customer groups from your cluster data.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-background/50">
                        <Wand2 className="h-12 w-12 text-primary mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Ready to Analyze?</h3>
                        <p className="text-sm text-muted-foreground mb-4">Click to generate insights from sample customer data.</p>
                        <Button onClick={handleAnalysis} disabled={isPending}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Generate Insights
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isPending && (
                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Analyzing Segments...</CardTitle>
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
                        <CardTitle className="font-headline">Segmentation Insights</CardTitle>
                        <CardDescription>AI-generated analysis of your customer segments.</CardDescription>
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
