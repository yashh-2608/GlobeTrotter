export interface SmartPlanInput {
  tripTitle: string
  destinationNames: string[]
  totalDays: number
}

export interface SmartPlanResult {
  summary: string
  highlights: string[]
  estimatedPacing: string
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function generateSmartPlan(input: SmartPlanInput): Promise<SmartPlanResult> {
  await sleep(1800)

  return {
    summary: `Smart plan ready for ${input.tripTitle}`,
    highlights: [
      `Focus on ${input.destinationNames[0] ?? "your first stop"} first for the strongest arrival energy.`,
      `Keep the middle of the trip flexible for food, rest, and weather changes.`,
      `Use ${input.totalDays} days as a guide, not a constraint.`,
    ],
    estimatedPacing:
      input.totalDays <= 5 ? "Fast-paced" : input.totalDays <= 10 ? "Balanced" : "Slow and immersive",
  }
}
