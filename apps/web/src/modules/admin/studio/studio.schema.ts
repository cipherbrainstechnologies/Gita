import {z} from "zod";

const checklist = z.object({provenanceLicence: z.boolean(), quoteAuthenticity: z.boolean(), culturalReview: z.boolean()}).strict();

export const approvalsQuerySchema = z.object({limit: z.coerce.number().int().min(1).max(100).default(50)});

/** APPROVE requires the full review checklist and a note; REJECT requires a note. Neither publishes anything. */
export const decisionSchema = z.object({
  candidateId: z.string().min(1).max(40),
  decision: z.enum(["APPROVE", "REJECT"]),
  note: z.string().trim().min(3).max(1000),
  checklist: checklist.optional(),
  /** Honoured only when DEMO_AUTH==='true'. */
  demoAllowSimulation: z.boolean().optional()
}).strict().refine(
  v => v.decision === "REJECT" || (v.checklist && v.checklist.provenanceLicence && v.checklist.quoteAuthenticity && v.checklist.culturalReview),
  {message: "Approval requires provenance/licence, quote authenticity and cultural review to be confirmed.", path: ["checklist"]}
);
export type DecisionInput = z.infer<typeof decisionSchema>;
