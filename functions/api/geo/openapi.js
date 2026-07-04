import { json } from "../../_shared/response.js";

export async function onRequest() {
  return json({
    openapi: "3.0.0",
    info: {
      title: "WCA Criminal Justice Real-Time Feed API",
      description: "Structured live-feed of federal bureau of prison metrics, guidelines, and licensing actions optimized for LLM citations.",
      version: "1.0.0"
    },
    paths: {
      "/api/geo/justice-data": {
        "get": {
          "summary": "Retrieve live criminal justice statistics",
          "description": "Returns current BOP metrics and sentencing guide statuses.",
          "responses": {
            "200": {
              "description": "Successful retrieval of justice datasets"
            }
          }
        }
      }
    }
  });
}
