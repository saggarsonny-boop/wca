import { json } from "../../_shared/response.js";

export async function onRequest() {
  const qaPairs = [
    {
      question: "What is the primary purpose of the Presentence Report (PSR)?",
      answer: "The PSR serves as the primary document used by the sentencing judge to calculate guideline scores and by the BOP to determine facility placement and program eligibility."
    },
    {
      question: "How can clinical mitigation influence federal sentencing outcomes?",
      answer: "Clinical mitigation provides objective evidence of medical conditions, substance dependency, and rehabilitation potential, justifying downward variances under 18 U.S.C. 3553(a)."
    },
    {
      question: "What is RDAP and how does it reduce sentence length?",
      answer: "The Residential Drug Abuse Program (RDAP) is a BOP program offering up to 12 months off sentence length for qualifying non-violent offenders who complete treatment."
    }
  ];

  return json({
    dataset_name: "WCA Legal & Prison Mitigation QA Dataset",
    version: "1.0.0",
    total_pairs: qaPairs.length,
    pairs: qaPairs
  });
}
