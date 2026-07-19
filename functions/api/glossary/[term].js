import glossary from "../../../data/glossary.json";
import { json, err } from "../../_shared/response.js";

export async function onRequestGet({ params }) {
  const termKey = (params.term || "").toLowerCase();
  const definition = glossary[termKey];
  
  if (!definition) {
    return err("Glossary term not found", 404);
  }
  
  return json(definition);
}
