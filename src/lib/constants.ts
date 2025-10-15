export const MOCK_CLUSTER_DATA = {
  "clusters": [
    {
      "cluster_id": 0,
      "segment_name": "High-Value Frequent Buyers",
      "size": 120,
      "avg_purchase_value": 250.75,
      "purchase_frequency": 12.5,
      "demographics": { "age_range": "35-50", "location": "Urban" }
    },
    {
      "cluster_id": 1,
      "segment_name": "New Occasional Shoppers",
      "size": 450,
      "avg_purchase_value": 45.50,
      "purchase_frequency": 1.8,
      "demographics": { "age_range": "18-25", "location": "Suburban" }
    },
    {
      "cluster_id": 2,
      "segment_name": "Loyal Budget Spenders",
      "size": 280,
      "avg_purchase_value": 85.20,
      "purchase_frequency": 6.2,
      "demographics": { "age_range": "28-40", "location": "Mixed" }
    },
    {
        "cluster_id": 3,
        "segment_name": "At-Risk Churners",
        "size": 50,
        "avg_purchase_value": 150.00,
        "purchase_frequency": 0.5,
        "demographics": { "age_range": "45-65", "location": "Rural" }
    }
  ]
};

// NOTE: This random data is generated at build time, so it's consistent across server and client.
export const MOCK_SCATTER_DATA = [
    ...Array.from({ length: 120 }, () => ({ purchase_frequency: Math.random() * 8 + 8, avg_purchase_value: Math.random() * 150 + 200, cluster: 'High-Value' })),
    ...Array.from({ length: 450 }, () => ({ purchase_frequency: Math.random() * 2, avg_purchase_value: Math.random() * 50 + 20, cluster: 'New Shoppers' })),
    ...Array.from({ length: 280 }, () => ({ purchase_frequency: Math.random() * 4 + 4, avg_purchase_value: Math.random() * 60 + 50, cluster: 'Budget Spenders' })),
    ...Array.from({ length: 50 }, () => ({ purchase_frequency: Math.random() * 1, avg_purchase_value: Math.random() * 100 + 100, cluster: 'At-Risk' })),
];

export const MOCK_BAR_CHART_DATA = [
    { name: "High-Value", size: 120, fill: "var(--color-chart-1)" },
    { name: "New Shoppers", size: 450, fill: "var(--color-chart-2)" },
    { name: "Budget", size: 280, fill: "var(--color-chart-3)" },
    { name: "At-Risk", size: 50, fill: "var(--color-chart-4)" },
];
