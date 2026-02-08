# ClaimifyEasy - Complete Integration Guide

## Overview
ClaimifyEasy is a comprehensive medical insurance claims management platform with AI-powered features, explainable reasoning, and accessibility enhancements.

## 🚀 Integrations

### 1. Grok AI (xAI) - Chat & Assistance
**Status**: ✅ Active
**Model**: grok-4-latest
**Purpose**: Intelligent claims assistance and policy guidance

#### Setup
```bash
XAI_API_KEY=your_api_key_here
```

#### Features
- Real-time claim status inquiries
- Policy information retrieval
- Claims submission guidance
- Settlement timeline assistance
- Platform guidance

#### API Endpoint
```
POST /api/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "What is my claim status?" }
  ],
  "explainable": false
}
```

#### Usage in Components
```typescript
import { useChat } from "@ai-sdk/react"

const { messages, input, append } = useChat({
  api: "/api/chat"
})
```

---

### 2. Explainable AI (XAI) - Transparent Reasoning
**Status**: ✅ Active
**Purpose**: Provide structured reasoning and confidence levels

#### Features
- Step-by-step reasoning breakdown
- Confidence scoring (HIGH/MEDIUM/LOW)
- Key data points extraction
- Transparent decision logic

#### Enable Explainable Mode
```typescript
// In chat component
const [showExplanations, setShowExplanations] = useState(false)

// When enabled, API calls include explainable: true
await fetch("/api/chat", {
  method: "POST",
  body: JSON.stringify({
    messages: [...],
    explainable: true  // Enable structured explanations
  })
})
```

#### Component Integration
```typescript
import { ExplanationDisplay } from "@/components/chat/explanation-display"

<ExplanationDisplay 
  explanation={{
    reasoning: ["Step 1", "Step 2", ...],
    confidence: 0.9,
    dataPoints: ["Point 1", "Point 2", ...]
  }}
/>
```

#### API Response Format
```json
{
  "role": "assistant",
  "content": "Your response here...",
  "explanation": {
    "reasoning": ["Logic step 1", "Logic step 2"],
    "confidence": 0.85,
    "dataPoints": ["Data point 1", "Data point 2"]
  }
}
```

---

### 3. ElevenLabs TTS - Text-to-Speech
**Status**: ✅ Active
**Voice ID**: JBFqnCBsd6RMkjVDRZzb (Professional)
**Model**: eleven_multilingual_v2
**Format**: MP3 (44100 Hz, 128 kbps)

#### Setup
```bash
ELEVENLABS_API_KEY=your_api_key_here
```

#### Features
- Natural multilingual voice synthesis
- Real-time audio playback
- Base64 audio encoding
- Error handling and fallbacks

#### API Endpoint
```
POST /api/text-to-speech
Content-Type: application/json

{
  "text": "Your text here",
  "voiceId": "JBFqnCBsd6RMkjVDRZzb",
  "model": "eleven_multilingual_v2"
}
```

#### Hook Usage
```typescript
import { useTextToSpeech } from "@/hooks/use-text-to-speech"

const { speak, isPlaying, stop } = useTextToSpeech()

// Read message aloud
await speak("Your text here")

// Stop playback
stop()
```

#### Component Integration in Chat
```typescript
<button onClick={() => handleSpeakMessage(msgId, text)}>
  <Volume2 className="h-4 w-4" />
</button>
```

---

### 4. Analytics Dashboard
**Status**: ✅ Active
**Path**: `/app/analytics`
**Components**: AnalyticsCharts, DashboardCharts

#### Data Types Supported
- Claims by status (submitted, under_review, approved, rejected, settled)
- Settlement timeline analysis
- Diagnosis distribution
- Monthly trends
- Confidence scoring

#### Charts Available
- **Status Mix**: Stacked bar chart by month
- **Settlement Days**: Line chart trends
- **Diagnosis Distribution**: Pie chart
- **Top Diagnoses**: Horizontal bar chart
- **Daily Claims**: Area chart

---

## 🔧 Environment Variables

### Required
```bash
# Grok AI
XAI_API_KEY=api keys here

# ElevenLabs TTS
ELEVENLABS_API_KEY=your_elevenlabs_key_here
```

### Optional
- `NEXT_PUBLIC_APP_URL`: Base URL for the application
- Analytics and database configuration (if using external storage)

---

## 🧪 Testing Integration

### Integration Dashboard
Access at: `/admin/integrations`

This page provides:
- Real-time integration status checks
- Manual test runners for each service
- Detailed error logging and diagnostics
- Status indicators (pass/fail/warning)

### Test Manually

#### 1. Test Grok AI
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "explainable": false
  }'
```

#### 2. Test Explainable AI
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "What is a claim?"}],
    "explainable": true
  }'
```

#### 3. Test ElevenLabs TTS
```bash
curl -X POST http://localhost:3000/api/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test audio message",
    "voiceId": "JBFqnCBsd6RMkjVDRZzb"
  }'
```

---

## 📊 Component Architecture

### Chat Widget
**Location**: `components/chat/chat-widget.tsx`
**Features**:
- Message history management
- AI response streaming
- Explainable mode toggle (brain icon)
- Text-to-speech controls (speaker icon)
- Loading states and error handling

### Explanation Display
**Location**: `components/chat/explanation-display.tsx`
**Features**:
- Collapsible reasoning sections
- Confidence visualization
- Data points listing
- Smooth animations

### TTS Hook
**Location**: `hooks/use-text-to-speech.ts`
**Features**:
- Audio playback state management
- Error handling
- Loading indicators
- Stop/pause functionality

---

## 🐛 Troubleshooting

### Grok AI Issues
**Error**: "Failed to connect to Grok AI"
- Verify `XAI_API_KEY` is set correctly
- Check API key hasn't expired
- Verify network connectivity

### Explainable AI Issues
**Error**: "Explanation parsing failed"
- Response format may not include reasoning markers
- Try with `explainable: true` explicitly
- Check Grok response structure

### ElevenLabs TTS Issues
**Error**: "ElevenLabs API key not configured"
- Verify `ELEVENLABS_API_KEY` environment variable
- Check voice ID is valid
- Ensure text content is provided

### Analytics Issues
**Error**: "No data displayed"
- Verify claims data exists in database
- Check status values match expected format
- Ensure timestamps are valid

---

## 📝 Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Grok AI API key verified and active
- [ ] ElevenLabs API key verified and active
- [ ] Chat widget tested with sample queries
- [ ] Text-to-speech audio playback verified
- [ ] Explainable AI mode tested
- [ ] Analytics dashboard loads without errors
- [ ] Mobile responsiveness verified
- [ ] Error pages display gracefully

---

## 🚀 Performance Notes

- Chat responses are streamed for better UX
- Audio is cached in base64 format for quick playback
- Analytics charts use React virtualization for large datasets
- Explanations are parsed on-demand to reduce overhead

---

## 📞 Support

For integration issues:
1. Check this README for troubleshooting
2. Access `/admin/integrations` dashboard
3. Review console logs with `[v0]` prefix
4. Contact support with specific error messages

---

**Last Updated**: 2026-02-08
**Version**: 1.0.0
