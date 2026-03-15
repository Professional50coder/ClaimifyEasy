# Workflow Integration - Quick Reference

## What Was Added

### New Files Created (10 files)
1. `lib/workflow-agents.ts` - AI agent implementations
2. `lib/workflow-executor.ts` - Workflow orchestration
3. `components/workflow-diagram.tsx` - Visual pipeline diagram
4. `components/fraud-analysis-results.tsx` - Fraud score display
5. `components/claims-decision-results.tsx` - Decision display
6. `components/workflow-overview.tsx` - Dashboard widget
7. `components/claim-detail-content.tsx` - Claim detail component
8. `app/api/workflow/execute/route.ts` - Start workflow endpoint
9. `app/api/workflow/status/[id]/route.ts` - Status endpoint
10. `app/api/workflow/results/[id]/route.ts` - Results endpoint
11. `app/claims/[id]/page.tsx` - Claim detail page
12. `app/workflow/page.tsx` - Pipeline dashboard

### Updated Files (2 files)
1. `lib/types.ts` - Added workflow types
2. `app/dashboard/page.tsx` - Added workflow overview widget

## How to Access

### View Pipeline Dashboard
- URL: `/workflow`
- Shows all workflow executions
- Displays pipeline architecture diagram

### View Claim with Workflow
- URL: `/claims/CLM-2024-001` (replace ID with actual claim)
- Shows complete workflow visualization
- Displays fraud analysis and decision results

### View Dashboard
- URL: `/dashboard`
- Shows active workflows in new overview card
- Quick navigation to pipeline dashboard

## API Endpoints

### Start Workflow
```
POST /api/workflow/execute
Body: { claimId: string, documents: Array<{text, type}> }
Response: { success: boolean, executionId: string, status: string }
```

### Check Status
```
GET /api/workflow/status/[id]
Response: { id, status, currentStage, progress, stages }
```

### Get Results
```
GET /api/workflow/results/[id]
Response: { executionId, claimId, status, documentProcessing, fraudAnalysis, claimsProcessing }
```

## Key Components

### WorkflowDiagram
Shows the three-stage AI pipeline with real-time status
- Props: `execution?: WorkflowExecution`, `compact?: boolean`
- Usage: `<WorkflowDiagram execution={execution} />`

### FraudAnalysisResults
Displays fraud score, risk level, and confidence
- Props: `result: FraudAnalysisResult`
- Usage: `<FraudAnalysisResults result={fraudResult} />`

### ClaimsDecisionResults
Shows approval percentage and final decision
- Props: `result: ClaimsProcessingResult`
- Usage: `<ClaimsDecisionResults result={decisionResult} />`

### WorkflowOverview
Dashboard widget for active workflows
- Props: `title?: string`, `description?: string`
- Usage: `<WorkflowOverview />`

## Data Types

### WorkflowExecution
```typescript
{
  id: string
  claimId: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  currentStage: WorkflowStage
  stages: WorkflowStageExecution[]
  documentProcessingOutput?: {...}
  fraudAnalysisResult?: FraudAnalysisResult
  claimsProcessingResult?: ClaimsProcessingResult
  startedAt: number
  completedAt?: number
  createdAt: number
  updatedAt: number
}
```

### FraudAnalysisResult
```typescript
{
  fraudScore: number (0-100)
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  detectedFlags: string[]
  confidence: number (0-1)
  reasoning: string
  explainability: {
    keyFactors: string[]
    dataPoints: Record<string, unknown>
  }
}
```

### ClaimsProcessingResult
```typescript
{
  approvalPercentage: number (0-100)
  decision: 'approved' | 'denied' | 'under_review'
  reasoning: string
  approvalAmount: number
  decisionDetails: {
    businessRulesApplied: string[]
    policyEligibility: boolean
    claimAmountValidation: boolean
    reviewRequired: boolean
  }
}
```

## Environment Variables Required

```
XAI_API_KEY=your_xai_api_key_here
```

## Integration Points

### Dashboard
- Adds WorkflowOverview widget after KPI cards
- Shows active workflows and navigation link
- No changes to existing functionality

### Claims Detail
- New dedicated page at `/claims/[id]`
- Replaces or complements existing detail view
- Full workflow visualization with tabbed interface

### Pipeline
- New page at `/workflow`
- Central hub for monitoring all workflows
- Stats, list view, and architecture diagram

## Demo Data

The implementation includes demo/sample data:
- 3 sample workflows with different statuses
- Demo claim with workflow execution results
- Sample fraud and decision results

To test:
1. Visit `/workflow` to see pipeline dashboard with sample workflows
2. Visit `/claims/CLM-2024-001` to see claim detail page
3. Visit `/dashboard` to see workflow overview widget

## Development Notes

### In-Memory Storage
Workflows are currently stored in memory. For production:
1. Replace Map in `lib/workflow-executor.ts` with database calls
2. Implement persistence layer
3. Add workflow history/archival

### Async Execution
Workflows execute asynchronously and don't block API responses (status 202).
Check status with polling or implement WebSocket for real-time updates.

### Error Handling
- Agents have fallback responses if they fail
- Invalid JSON responses are handled gracefully
- Individual stage failures are tracked

## File Sizes & Performance

- workflow-agents.ts: ~6KB
- workflow-executor.ts: ~6KB
- workflow-diagram.tsx: ~8KB
- Components total: ~30KB
- API routes: ~3KB
- Pages: ~5KB

Total addition: ~60KB of new code

## What's Next

1. **Test the Workflow**
   - Navigate to `/workflow` and `/claims/[id]`
   - Check API responses
   - Verify agent outputs

2. **Configure Production**
   - Set up database for workflow storage
   - Configure proper error logging
   - Set up monitoring/alerts

3. **Enhance Features**
   - Add batch processing
   - Implement webhooks
   - Create analytics dashboard
   - Add workflow templates

4. **Integrate with External Services**
   - Real fraud detection services
   - Policy lookup systems
   - Medical cost benchmarking
   - Third-party verification services

---

**For detailed information**, see: `WORKFLOW_INTEGRATION_GUIDE.md`
