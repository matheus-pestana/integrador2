export const MOCK_CLUSTER_DATA = {
  "clusters": [
    {
      "cluster_id": 0,
      "segment_name": "Clientes Frequentes de Alto Valor",
      "size": 120,
      "avg_purchase_value": 250.75,
      "purchase_frequency": 12.5,
      "demographics": { "age_range": "35-50", "location": "Urbana" }
    },
    {
      "cluster_id": 1,
      "segment_name": "Novos Compradores Ocasionais",
      "size": 450,
      "avg_purchase_value": 45.50,
      "purchase_frequency": 1.8,
      "demographics": { "age_range": "18-25", "location": "Suburbana" }
    },
    {
      "cluster_id": 2,
      "segment_name": "Clientes Fiéis de Baixo Custo",
      "size": 280,
      "avg_purchase_value": 85.20,
      "purchase_frequency": 6.2,
      "demographics": { "age_range": "28-40", "location": "Mista" }
    },
    {
        "cluster_id": 3,
        "segment_name": "Clientes em Risco de Evasão",
        "size": 50,
        "avg_purchase_value": 150.00,
        "purchase_frequency": 0.5,
        "demographics": { "age_range": "45-65", "location": "Rural" }
    }
  ]
};

// NOTA: Estes dados aleatórios são gerados no build, então são consistentes no servidor e cliente.
export const MOCK_SCATTER_DATA = [
    ...Array.from({ length: 120 }, () => ({ purchase_frequency: Math.random() * 8 + 8, avg_purchase_value: Math.random() * 150 + 200, cluster: 'Alto Valor' })),
    ...Array.from({ length: 450 }, () => ({ purchase_frequency: Math.random() * 2, avg_purchase_value: Math.random() * 50 + 20, cluster: 'Novos Clientes' })),
    ...Array.from({ length: 280 }, () => ({ purchase_frequency: Math.random() * 4 + 4, avg_purchase_value: Math.random() * 60 + 50, cluster: 'Clientes Econômicos' })),
    ...Array.from({ length: 50 }, () => ({ purchase_frequency: Math.random() * 1, avg_purchase_value: Math.random() * 100 + 100, cluster: 'Em Risco' })),
];

export const MOCK_BAR_CHART_DATA = [
    { name: "Alto Valor", size: 120, fill: "hsl(var(--chart-1))" },
    { name: "Novos Clientes", size: 450, fill: "hsl(var(--chart-2))" },
    { name: "Econômicos", size: 280, fill: "hsl(var(--chart-3))" },
    { name: "Em Risco", size: 50, fill: "hsl(var(--chart-4))" },
];