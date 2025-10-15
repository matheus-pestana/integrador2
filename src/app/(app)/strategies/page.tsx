"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getMarketingStrategies, type StrategiesState } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lightbulb } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const initialState: StrategiesState = {};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
            Generate Strategies
        </Button>
    );
}


export default function StrategiesPage() {
    const [state, formAction] = useFormState(getMarketingStrategies, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (state.message && state.message !== 'success') {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: state.message,
            });
        }
    }, [state, toast]);

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Marketing Strategy Generator</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Generate personalized marketing strategies for specific customer segments and campaign objectives. 
                    Fill out the form below to get AI-powered recommendations.
                </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 items-start">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Strategy</CardTitle>
                        <CardDescription>Describe your segment and goals.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={formAction} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="customerSegmentAttributes">Customer Segment Attributes</Label>
                                <Textarea
                                    id="customerSegmentAttributes"
                                    name="customerSegmentAttributes"
                                    placeholder="e.g., High-income urban professionals, age 30-45, interested in luxury travel and technology."
                                    className="min-h-[120px]"
                                />
                                {state.errors?.customerSegmentAttributes && <p className="text-sm text-destructive">{state.errors.customerSegmentAttributes[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="campaignObjectives">Campaign Objectives</Label>
                                <Textarea
                                    id="campaignObjectives"
                                    name="campaignObjectives"
                                    placeholder="e.g., Increase brand awareness, drive sign-ups for a new premium service, boost Q3 sales by 15%."
                                    className="min-h-[120px]"
                                />
                                {state.errors?.campaignObjectives && <p className="text-sm text-destructive">{state.errors.campaignObjectives[0]}</p>}
                            </div>
                            <SubmitButton />
                        </form>
                    </CardContent>
                </Card>
                
                <Card className="flex flex-col min-h-[500px]">
                    <CardHeader>
                        <CardTitle>Generated Strategies</CardTitle>
                        <CardDescription>Your AI-powered marketing ideas will appear here.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center p-6">
                        {state.strategies ? (
                            <Accordion type="single" collapsible className="w-full">
                                {state.strategies.map((strategy, index) => (
                                    <AccordionItem value={`item-${index}`} key={index}>
                                        <AccordionTrigger>Strategy {index + 1}</AccordionTrigger>
                                        <AccordionContent className="text-base">
                                            {strategy}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg w-full">
                                <Lightbulb className="mx-auto h-12 w-12" />
                                <p className="mt-4 font-medium">Your strategies are waiting</p>
                                <p className="text-sm">Fill out the form to get started.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
