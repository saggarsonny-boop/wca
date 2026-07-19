import glossary from "../../../data/glossary.json";
import { json } from "../../../_shared/response.js";

export async function onRequestGet() {
  return json(Object.values(glossary));
}
