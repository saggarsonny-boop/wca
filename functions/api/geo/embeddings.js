import { json } from "../../_shared/response.js";

export async function onRequest() {
  const mockEmbeddings = [
    {
      entity: "Presentence Report (PSR)",
      vector_dimension: 1536,
      sample_vector: [0.0125, -0.0048, 0.0892, 0.0031, -0.0156] // Truncated representation
    },
    {
      entity: "Residential Drug Abuse Program (RDAP)",
      vector_dimension: 1536,
      sample_vector: [0.0211, -0.0089, 0.0543, -0.0112, 0.0045]
    }
  ];

  return json({
    engine: "wca-embeddings-v1",
    model: "text-embedding-3-small",
    entities: mockEmbeddings
  });
}
