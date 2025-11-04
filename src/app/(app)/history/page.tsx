// src/app/(app)/history/page.tsx

import Link from "next/link";
import { getSavedAnalyses } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function HistoryPage() {
  const state = await getSavedAnalyses();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight flex items-center gap-2">
          <History className="h-8 w-8" />
          Analysis History
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Review previously generated customer segmentation analyses.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Analyses</CardTitle>
          <CardDescription>
            Select an analysis to view its details and dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.message === 'error' && (
            <div className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <p>Could not load history: {state.errorMessage}</p>
            </div>
          )}

          {state.analyses && state.analyses.length === 0 && (
            <p className="text-muted-foreground">No analyses saved yet. Run a new analysis on the "Segmentation" page to see it here.</p>
          )}

          {state.analyses && state.analyses.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Clusters</TableHead>
                  <TableHead>Data Snippet</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.analyses.map((analysis) => (
                  <TableRow key={analysis.id}>
                    <TableCell>
                      <Badge variant="outline">{analysis.id}</Badge>
                    </TableCell>
                    <TableCell>{new Date(analysis.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{analysis.number_of_clusters}</TableCell>
                    <TableCell className="font-mono text-xs">{analysis.original_data_snippet}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/history/${analysis.id}`}>View Dashboard</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}