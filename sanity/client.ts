import { createClient } from "next-sanity";
export const client = createClient({
  projectId: "g7h3ej8a",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});