// src/app/(app)/history/page.tsx

import Link from "next/link";
import { getSavedAnalyses } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { AlertCircle, History, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default async function HistoryPage() {
  const state = await getSavedAnalyses();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight flex items-center gap-2">
          <History className="h-8 w-8" />
          Histórico de Análises
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Consulte as análises de segmentação geradas anteriormente.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análises Salvas</CardTitle>
          <CardDescription>
            Selecione uma análise para ver seus detalhes e carregar no dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.message === 'error' && (
            <div className="text-destructive-foreground bg-destructive/90 p-4 rounded-md flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Não foi possível carregar o histórico:</p>
                <p className="text-sm">{state.errorMessage}</p>
              </div>
            </div>
          )}

          {state.analyses && state.analyses.length === 0 && (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <History className="mx-auto h-12 w-12" />
                <p className="mt-4 font-medium">Nenhuma análise salva</p>
                <p className="text-sm">Execute uma nova análise na página "Segmentação" para salvá-la aqui.</p>
            </div>
          )}

          {state.analyses && state.analyses.length > 0 && (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Clusters</TableHead>
                    <TableHead>Amostra dos Dados</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.analyses.map((analysis) => (
                    <TableRow key={analysis.id}>
                      <TableCell>
                        <Badge variant="outline">#{analysis.id}</Badge>
                      </TableCell>
                      <TableCell>{new Date(analysis.timestamp).toLocaleString('pt-BR')}</TableCell>
                      <TableCell>{analysis.number_of_clusters}</TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-mono text-xs cursor-default">
                                {analysis.original_data_snippet}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Início dos dados usados para esta análise</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/history/${analysis.id}`}>
                             <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}