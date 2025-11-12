// src/app/(app)/history/[id]/page.tsx

'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSavedAnalysisById } from '@/lib/actions';
import { useSegmentation } from '@/context/segmentation-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoadHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const { setAnalysis } = useSegmentation();
  const { toast } = useToast();

  useEffect(() => {
    const analysisId = Array.isArray(params.id) ? params.id[0] : params.id;
    const id = Number(analysisId);

    if (isNaN(id)) {
      toast({
        variant: 'destructive',
        title: 'ID Inválido',
        description: 'O ID da análise fornecido não é válido.',
      });
      router.push('/history');
      return;
    }

    async function loadAnalysis() {
      const state = await getSavedAnalysisById(id);
      
      if (state.message === 'success' && state.analysis) {
        // Define a análise no contexto global
        setAnalysis(state.analysis);
        toast({
          title: `Análise #${id} Carregada`,
          description: 'Visualizando dados históricos no dashboard.',
        });
        // Redireciona para o dashboard
        router.push('/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao Carregar Análise',
          description: state.errorMessage || 'Não foi possível encontrar a análise solicitada.',
        });
        router.push('/history');
      }
    }

    loadAnalysis();
  }, [params.id, setAnalysis, router, toast]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-lg">Loading analysis...</p>
      </div>
    </div>
  );
}