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
            Gerar Estratégias
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
                title: 'Erro',
                description: state.message,
            });
        }
    }, [state, toast]);

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Gerador de Estratégias de Marketing</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Gere estratégias de marketing personalizadas para segmentos de clientes e objetivos de campanha específicos.
                    Preencha o formulário abaixo para obter recomendações alimentadas por IA.
                </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 items-start">
                <Card>
                    <CardHeader>
                        <CardTitle>Criar Nova Estratégia</CardTitle>
                        <CardDescription>Descreva seu segmento e seus objetivos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={formAction} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="customerSegmentAttributes">Atributos do Segmento de Clientes</Label>
                                <Textarea
                                    id="customerSegmentAttributes"
                                    name="customerSegmentAttributes"
                                    placeholder="ex: Profissionais urbanos de alta renda, 30-45 anos, interessados em viagens de luxo e tecnologia."
                                    className="min-h-[120px]"
                                />
                                {state.errors?.customerSegmentAttributes && <p className="text-sm text-destructive">{state.errors.customerSegmentAttributes[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="campaignObjectives">Objetivos da Campanha</Label>
                                <Textarea
                                    id="campaignObjectives"
                                    name="campaignObjectives"
                                    placeholder="ex: Aumentar o reconhecimento da marca, impulsionar inscrições para um novo serviço premium, aumentar as vendas do terceiro trimestre em 15%."
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
                        <CardTitle>Estratégias Geradas</CardTitle>
                        <CardDescription>Suas ideias de marketing geradas por IA aparecerão aqui.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center p-6">
                        {state.strategies ? (
                            <Accordion type="single" collapsible className="w-full">
                                {state.strategies.map((strategy, index) => (
                                    <AccordionItem value={`item-${index}`} key={index}>
                                        <AccordionTrigger>Estratégia {index + 1}</AccordionTrigger>
                                        <AccordionContent className="text-base">
                                            {strategy}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg w-full">
                                <Lightbulb className="mx-auto h-12 w-12" />
                                <p className="mt-4 font-medium">Suas estratégias estão à espera</p>
                                <p className="text-sm">Preencha o formulário para começar.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}