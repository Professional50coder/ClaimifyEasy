import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
import type { FraudAnalysisResult, ClaimsProcessingResult } from "./types"

/**
 * Document Processing Agent
 * Extracts structured information from multiple document types
 */
export async function documentProcessingAgent(documents: {
  text: string
  type: string
}[]): Promise<{
  claimantInfo: Record<string, unknown>
  incidentDetails: Record<string, unknown>
  claimsAmounts: Record<string, unknown>
}> {
  try {
    const documentSummary = documents
      .map((doc) => `${doc.type}: ${doc.text.substring(0, 500)}`)
      .join("\n\n")

    const { text } = await generateText({
      model: xai("grok-4", {
        apiKey: process.env.XAI_API_KEY,
      }),
      system: `You are an expert document processing agent. Extract structured information from medical insurance claim documents.
Extract and return ONLY valid JSON with this exact structure:
{
  "claimantInfo": {
    "name": "full name",
    "dateOfBirth": "YYYY-MM-DD",
    "policyNumber": "policy ID",
    "contactInfo": "phone or email"
  },
  "incidentDetails": {
    "dateOfIncident": "YYYY-MM-DD",
    "description": "brief description",
    "location": "where it happened",
    "witnesses": "number or names"
  },
  "claimsAmounts": {
    "totalClaimed": number,
    "medicalCosts": number,
    "additionalExpenses": number,
    "currency": "USD"
  }
}`,
      prompt: `Process these claim documents:\n\n${documentSummary}`,
    })

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from agent response")
    }

    const parsed = JSON.parse(jsonMatch[0])
    return {
      claimantInfo: parsed.claimantInfo || {},
      incidentDetails: parsed.incidentDetails || {},
      claimsAmounts: parsed.claimsAmounts || {},
    }
  } catch (error) {
    console.error("[v0] Document Processing Agent error:", error)
    throw error
  }
}

/**
 * Fraud Analysis Agent
 * Analyzes claim data for fraud indicators and risk assessment
 */
export async function fraudAnalysisAgent(claimData: {
  claimantInfo: Record<string, unknown>
  incidentDetails: Record<string, unknown>
  claimsAmounts: Record<string, unknown>
  claimHistory?: Record<string, unknown>
}): Promise<FraudAnalysisResult> {
  try {
    const { text } = await generateText({
      model: xai("grok-4", {
        apiKey: process.env.XAI_API_KEY,
      }),
      system: `You are an expert fraud detection agent for insurance claims. Analyze claim data and return ONLY valid JSON.
Return this exact structure:
{
  "fraudScore": number between 0-100,
  "riskLevel": "low" or "medium" or "high" or "critical",
  "detectedFlags": ["flag1", "flag2"],
  "confidence": number between 0-1,
  "reasoning": "brief explanation",
  "keyFactors": ["factor1", "factor2"],
  "recommendations": "action to take"
}

Consider:
- Claim amount consistency
- Document authenticity indicators
- Claim history patterns
- Incident plausibility
- Medical cost reasonableness`,
      prompt: `Analyze this claim for fraud risk:\n\n${JSON.stringify(claimData, null, 2)}`,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from agent response")
    }

    const parsed = JSON.parse(jsonMatch[0])
    return {
      fraudScore: Math.max(0, Math.min(100, parsed.fraudScore || 0)),
      riskLevel: (parsed.riskLevel as "low" | "medium" | "high" | "critical") || "medium",
      detectedFlags: parsed.detectedFlags || [],
      confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
      reasoning: parsed.reasoning || "Analysis completed",
      explainability: {
        keyFactors: parsed.keyFactors || [],
        dataPoints: {
          recommendation: parsed.recommendations,
          timestamp: new Date().toISOString(),
        },
      },
    }
  } catch (error) {
    console.error("[v0] Fraud Analysis Agent error:", error)
    // Return a neutral fraud result on error
    return {
      fraudScore: 50,
      riskLevel: "medium",
      detectedFlags: ["analysis_error"],
      confidence: 0.3,
      reasoning: "Unable to complete analysis. Manual review recommended.",
      explainability: {
        keyFactors: ["error_in_processing"],
        dataPoints: { error: String(error) },
      },
    }
  }
}

/**
 * Claims Processing Agent
 * Makes final approval decision based on fraud analysis and business rules
 */
export async function claimsProcessingAgent(
  claimData: Record<string, unknown>,
  fraudAnalysis: FraudAnalysisResult,
): Promise<ClaimsProcessingResult> {
  try {
    const { text } = await generateText({
      model: xai("grok-4", {
        apiKey: process.env.XAI_API_KEY,
      }),
      system: `You are a claims processing decision agent. Make approval decisions based on fraud analysis and claim data.
Return ONLY valid JSON with this structure:
{
  "approvalPercentage": number 0-100,
  "decision": "approved" or "denied" or "under_review",
  "reasoning": "explanation",
  "approvalAmount": number,
  "businessRulesApplied": ["rule1", "rule2"],
  "policyEligibility": boolean,
  "claimAmountValidation": boolean,
  "reviewRequired": boolean
}

Decision logic:
- If fraudScore > 75: DENY
- If fraudScore > 50: UNDER_REVIEW (50-75% approval)
- If fraudScore < 30: Consider APPROVAL (80-100%)
- Apply policy coverage validation
- Calculate approval percentage based on risk and validity`,
      prompt: `Process this claim:
Fraud Analysis: ${JSON.stringify(fraudAnalysis)}
Claim Data: ${JSON.stringify(claimData)}

Provide the final decision.`,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from agent response")
    }

    const parsed = JSON.parse(jsonMatch[0])
    return {
      approvalPercentage: Math.max(0, Math.min(100, parsed.approvalPercentage || 50)),
      decision: (parsed.decision as "approved" | "denied" | "under_review") || "under_review",
      reasoning: parsed.reasoning || "Decision pending review",
      approvalAmount: parsed.approvalAmount || 0,
      decisionDetails: {
        businessRulesApplied: parsed.businessRulesApplied || [],
        policyEligibility: parsed.policyEligibility ?? true,
        claimAmountValidation: parsed.claimAmountValidation ?? true,
        reviewRequired: parsed.reviewRequired ?? false,
      },
    }
  } catch (error) {
    console.error("[v0] Claims Processing Agent error:", error)
    // Return conservative decision on error
    return {
      approvalPercentage: 0,
      decision: "under_review",
      reasoning: "Unable to process. Manual review required.",
      approvalAmount: 0,
      decisionDetails: {
        businessRulesApplied: [],
        policyEligibility: true,
        claimAmountValidation: true,
        reviewRequired: true,
      },
    }
  }
}
