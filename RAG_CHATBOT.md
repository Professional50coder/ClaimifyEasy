# RAG-Based Chatbot Implementation

## Overview

The ClaimifyEasy platform now features a **Retrieval-Augmented Generation (RAG)** based chatbot powered by Grok AI (xAI). This intelligent assistant provides personalized, context-aware responses by combining claim data and document information with advanced language modeling.

## Architecture

### Components

1. **RAG Retriever** (`lib/rag-retriever.ts`)
   - Intelligent document and claim retrieval based on user queries
   - Relevance scoring using similarity calculations
   - Context extraction and formatting

2. **Chat API** (`app/api/chat/route.ts`)
   - Integrates RAG context into system prompts
   - Processes user messages with Grok AI
   - Supports explainable AI mode with reasoning breakdown

3. **Chat Widget** (`components/chat/chat-widget.tsx`)
   - Floating chat interface with RAG capabilities
   - Explanation mode to show AI reasoning
   - Text-to-speech support for responses
   - Real-time message streaming

## How RAG Works

### Query Processing Flow

```
User Query
    ↓
RAG Retriever Module
    ├─ Search Claims Database
    ├─ Search Uploaded Documents
    ├─ Score by Relevance
    └─ Extract Top Results
    ↓
Context Building
    └─ Format claim/document summaries
    ↓
Grok AI Processing
    ├─ Receives RAG context in system prompt
    ├─ Generates response using context
    └─ Returns structured answer
    ↓
User Response with Optional Explanation
```

### Similarity Scoring Algorithm

The RAG system uses cosine similarity for relevance scoring:

```
Similarity(query, text) = intersection / union of terms
```

This ensures responses are tailored to user queries by finding the most relevant:
- **Claims**: by diagnosis, status, hospital, or amount
- **Documents**: by name, type, and content summary

## Features

### 1. Intelligent Claim Retrieval

The chatbot automatically retrieves relevant claims when users ask about:
- **Status**: "What's my claim status?" → Retrieves similar claims
- **Diagnosis**: "I have dengue fever" → Shows dengue-related claims
- **Hospital**: "Which hospital should I go to?" → Searches hospital records
- **Timeline**: "How long will settlement take?" → Uses claim timeline data

### 2. Document-Aware Responses

When documents are uploaded, the chatbot:
- Extracts summaries and metadata
- Matches documents to queries
- Provides file references in answers
- Helps with document-related questions

### 3. Explainable AI Mode

Users can enable "Brain" toggle to see:
- **Reasoning Steps**: How the AI arrived at conclusions
- **Confidence Level**: HIGH/MEDIUM/LOW ratings
- **Key Data Points**: Specific claims/documents used
- **Data Sources**: References to claim IDs and documents

### 4. Multi-Modal Support

- **Text Chat**: Standard messaging interface
- **Text-to-Speech**: Listen to AI responses
- **Message History**: Conversation persistence
- **Markdown Support**: Formatted responses with lists and emphasis

## Usage Examples

### Example 1: Claim Status Query

**User**: "What's my recent claim status?"

**RAG Process**:
1. Identifies keywords: "recent", "claim", "status"
2. Retrieves last 3 claims from database
3. Calculates relevance scores
4. Extracts top 1-2 claims with highest scores

**Response**: Provided with specific claim details from RAG context

### Example 2: Policy Question with Documents

**User**: "What's covered under my policy?"

**RAG Process**:
1. Searches uploaded documents for "policy", "coverage"
2. Matches policy documents if available
3. References document summaries in response
4. Provides specific coverage information

### Example 3: Hospital Recommendation

**User**: "Where should I get treated for appendicitis?"

**RAG Process**:
1. Finds claims with "appendicitis" diagnosis
2. Retrieves hospitals used for similar cases
3. Shows claim outcomes at each hospital
4. Provides data-driven recommendation

## Configuration

### Environment Variables

```env
XAI_API_KEY=your_grok_api_key_here
```

### System Requirements

- Node.js 16+
- Next.js 16+
- AI SDK 6.0+
- xAI Grok API access

## Integration Points

### Database Integration

The RAG system accesses:
- **Claims Data**: `lib/db.ts` → `getDatabase().claims`
- **Document Data**: `lib/db.ts` → `getDatabase().docs`
- **User Data**: `lib/db.ts` → `getDatabase().users`

### API Integration

```typescript
// Chat API endpoint
POST /api/chat
{
  "messages": [{ role, content }],
  "explainable": boolean
}

// Response format
{
  "role": "assistant",
  "content": "...",
  "explanation": {
    "reasoning": ["step1", "step2"],
    "confidence": 0.85,
    "dataPoints": ["claim-id", "document-ref"]
  }
}
```

## Performance Optimization

### Context Limiting

- Maximum 3 claims retrieved per query
- Maximum 2 documents retrieved per query
- Context size limited to <2000 tokens
- Efficient similarity scoring using set operations

### Caching Strategy

Suggested improvements for production:
1. Cache frequently accessed claims
2. Pre-compute document embeddings
3. Implement vector similarity search (Pinecone, Weaviate)
4. Rate limiting for API calls

## Advanced Features (Roadmap)

### Phase 2: Vector Embeddings

- Replace simple similarity with semantic embeddings
- Use OpenAI embeddings or open-source alternatives
- Enable semantic search across all fields

### Phase 3: Multi-Modal RAG

- Extract text from PDF documents
- Process images in claim forms
- Analyze claim attachments

### Phase 4: Fine-Tuning

- Fine-tune Grok model on domain-specific data
- Learn from user feedback
- Improve accuracy over time

## Troubleshooting

### Issue: Chat not retrieving relevant data

**Solution**: 
- Check if claims/documents exist in database
- Verify similarity scoring is calculating correctly
- Enable debug logging in RAG retriever

### Issue: Slow response times

**Solution**:
- Reduce context limit
- Implement caching layer
- Consider vector database for large datasets

### Issue: Inaccurate responses

**Solution**:
- Improve claim summaries for better matching
- Add metadata tags to documents
- Fine-tune similarity thresholds

## API Reference

### buildRAGContext(query: string): string

Builds complete RAG context from claims and documents.

```typescript
import { buildRAGContext } from "@/lib/rag-retriever"

const context = buildRAGContext("claim status")
// Returns formatted context string with relevant claims and documents
```

### getClaimsContext(query: string, limit?: number): string

Retrieves relevant claims based on query similarity.

```typescript
const claims = getClaimsContext("dengue fever", 5)
// Returns top 5 claims related to dengue fever
```

### getDocumentsContext(query: string, limit?: number): string

Retrieves relevant documents based on query similarity.

```typescript
const docs = getDocumentsContext("policy coverage", 3)
// Returns top 3 documents related to policy coverage
```

## Best Practices

1. **Update Claim Summaries**: Keep diagnosis and status descriptions consistent
2. **Document Metadata**: Add descriptive names and summaries to uploaded documents
3. **User Feedback**: Allow users to rate response quality for training
4. **Privacy**: Never expose sensitive user data in chat responses
5. **Fallbacks**: Always have support contact info for unanswered questions

## Future Enhancements

- [ ] Vector embeddings for semantic search
- [ ] Multi-turn conversation context
- [ ] Real-time claim updates in chat
- [ ] Custom RAG fine-tuning
- [ ] Integration with external knowledge bases
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Chat analytics dashboard
