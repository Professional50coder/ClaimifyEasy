# ElevenLabs Text-to-Speech Integration

## Overview
ClaimifyEasy now includes ElevenLabs text-to-speech capabilities for enhanced accessibility. AI assistant responses in the chat widget can be read aloud using natural-sounding voices.

## Features Integrated

### 1. **Backend API Route** (`/app/api/text-to-speech/route.ts`)
- Handles text-to-speech conversion requests
- Uses ElevenLabs SDK with default voice: "JBFqnCBsd6RMkjVDRZzb"
- Returns MP3 audio as base64-encoded data
- Includes error handling and API key validation

### 2. **React Hook** (`/hooks/use-text-to-speech.ts`)
- `useTextToSpeech()` - Custom hook for managing TTS functionality
- Manages loading, playing, and error states
- Methods:
  - `speak(text)` - Convert text to speech and play
  - `stop()` - Stop audio playback
  - Returns: `isLoading`, `isPlaying`, `error`, and control functions

### 3. **Chat Widget Enhancement** (`/components/chat/chat-widget.tsx`)
- Added speaker icon button for each AI response
- Click to read message aloud or stop playback
- Visual feedback showing active playback
- Integrated with the existing Grok AI and explanation features

### 4. **Dependencies Added**
- `elevenlabs` - Official ElevenLabs SDK for Node.js

## Environment Setup
- **Environment Variable**: `ELEVENLABS_API_KEY`
- Add your ElevenLabs API key to your Vercel project environment

## Customization

### Change Voice
Modify the default `voiceId` in:
- `/hooks/use-text-to-speech.ts` (line 49)
- `/app/api/text-to-speech/route.ts` (line 11)

Available voice IDs can be found at: https://elevenlabs.io/docs/api-reference/voices

### Adjust Audio Quality
Modify `output_format` in `/app/api/text-to-speech/route.ts`:
- `mp3_44100_128` - Current (44.1kHz, 128kbps)
- `mp3_44100_64` - Lower quality
- `mp3_96000_128` - Higher quality

## Usage
1. Open chat widget
2. Get a response from Grok AI
3. Click the speaker icon next to the message
4. Audio plays using ElevenLabs voice
5. Click again to stop playback

## Architecture Diagram
```
Chat Widget
    ↓
[Message from Grok]
    ↓
[Speaker Icon Button]
    ↓
/api/text-to-speech (POST)
    ↓
ElevenLabs API
    ↓
Returns: MP3 Base64
    ↓
HTML Audio Element
    ↓
User Hears Message
```

## Error Handling
- Missing API key: Returns 500 error with configuration message
- Invalid text: Caught in hook with user-friendly error state
- Network errors: Logged and handled gracefully

## Performance Considerations
- Audio is generated on-demand
- Base64 encoding for seamless browser playback
- Consider caching frequently asked questions if needed
