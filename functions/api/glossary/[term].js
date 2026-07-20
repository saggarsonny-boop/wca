import glossaryEn from "../../../data/glossary.json";
import glossaryEs from "../../../data/glossary-es.json";
import glossaryFr from "../../../data/glossary-fr.json";
import { json, err } from "../../_shared/response.js";

export async function onRequestGet({ params, request }) {
  const url = new URL(request.url);
  const lang = (url.searchParams.get("lang") || "en").toLowerCase();
  
  let database = glossaryEn;
  if (lang === "es") database = glossaryEs;
  else if (lang === "fr") database = glossaryFr;

  const termKey = (params.term || "").toLowerCase();
  const definition = database[termKey];
  
  if (!definition) {
    return err("Glossary term not found", 404);
  }
  
  return json(definition);
}
