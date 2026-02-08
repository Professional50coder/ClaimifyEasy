# ClaimifyEasy - Quick Start Guide

## 🚀 Getting Started (5 Minutes)

### 1. Environment Setup

Add these to your `.env.local`:

```bash
# Grok AI - From your xAI account
XAI_API_KEY=api keys here

# ElevenLabs - From your ElevenLabs account
ELEVENLABS_API_KEY=your_elevenlabs_key_here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## ✨ Main Features

### Chat with Grok AI
- Click the chat bubble in the bottom right
- Ask about claims, policies, or settlement info
- Responses powered by Grok-4 AI

### Enable Explanations
- Click the brain icon in the chat header
- AI will explain its reasoning step-by-step
- See confidence levels and data points

### Listen to Responses
- Click the speaker icon next to AI messages
- Natural voice synthesis via ElevenLabs
- Click again to stop playback

### View Analytics
- Navigate to `/app/analytics`
- See claims trends, status breakdown, diagnoses
- Interactive charts with real-time data

### Test All Integrations
- Go to `/admin/integrations`
- Click "Run Tests" button
- Check status of each service
- View detailed diagnostics

---

## 📋 Common Tasks

### Ask About Your Claim Status
```
User: "What is the status of my claim from January?"
Grok: [Provides status information]
You: Click brain icon to see reasoning
You: Click speaker to hear response
```

### Get Policy Information
```
User: "What does my policy cover?"
Grok: [Explains coverage details]
```

### Submit a New Claim
```
User: "How do I submit a new claim?"
Grok: [Provides step-by-step guidance]
```

### View Settlement Timeline
```
User: "How long will my settlement take?"
Grok: [Explains typical timelines]
```

---

## 🔍 Verification Checklist

- [ ] Chat widget appears in bottom right
- [ ] Can type and send messages
- [ ] Grok responds to queries
- [ ] Brain icon toggles explanations
- [ ] Speaker icon plays audio
- [ ] Analytics dashboard loads
- [ ] Integration tests pass

---

## 🆘 Quick Troubleshooting

**Chat not working?**
- Check XAI_API_KEY is set
- Verify it's in .env.local (not .env)
- Restart dev server

**Audio not playing?**
- Check ELEVENLABS_API_KEY is set
- Verify volume is enabled in browser
- Check browser console for errors

**Explanations not showing?**
- Click brain icon in chat header
- Try asking a complex question
- Check browser console

**Analytics empty?**
- Visit `/dashboard` first to seed data
- Refresh analytics page
- Check database connection

---

## 📚 Learn More

- Full docs: `INTEGRATIONS_README.md`
- Component overview: `components/chat/`
- API routes: `app/api/`
- Hooks: `hooks/`

---

## 🎯 Next Steps

1. Customize the system prompts in `/app/api/chat/route.ts`
2. Add more voices/languages in TTS settings
3. Connect your database for persistent data
4. Deploy to Vercel for production

**Ready to explore?** → Open http://localhost:3000 🎉
