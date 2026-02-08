# ClaimifyEasy - Test Scenarios

## 🧪 Comprehensive Testing Guide

Each scenario validates specific integrations and features. Run through all scenarios to ensure complete system functionality.

---

## Scenario 1: Basic Chat (5 min)

**Objective**: Verify Grok AI responds to basic queries

**Steps**:
1. Open http://localhost:3000
2. Click chat bubble (bottom right)
3. Type: "Hello, what is ClaimifyEasy?"
4. Submit message

**Expected Results**:
- ✅ Chat opens smoothly
- ✅ Message appears in chat history
- ✅ Grok responds within 2 seconds
- ✅ Response is relevant and professional
- ✅ No console errors

**Test Passed If**: Response is received and displayed correctly

---

## Scenario 2: Claim Status Query (5 min)

**Objective**: Test claims-specific functionality

**Steps**:
1. In chat, type: "What is my claim status?"
2. Submit
3. Observe response

**Expected Results**:
- ✅ Grok provides claim status guidance
- ✅ Response includes relevant information
- ✅ Formatting is clear and readable
- ✅ No API errors in console

**Test Passed If**: Grok provides a helpful claims-related response

---

## Scenario 3: Enable Explanations (5 min)

**Objective**: Verify Explainable AI feature works

**Steps**:
1. In chat header, click brain icon (should highlight)
2. Type: "Why do medical claims take time to process?"
3. Submit message
4. Wait for response
5. Look for explanation section below response

**Expected Results**:
- ✅ Brain icon toggles on (highlighted)
- ✅ Grok generates detailed response
- ✅ ExplanationDisplay component appears
- ✅ Shows reasoning steps
- ✅ Shows confidence level (HIGH/MEDIUM/LOW)
- ✅ Shows data points
- ✅ Explanation is collapsed initially
- ✅ Can expand to read full details

**Test Passed If**: Explanation displays with all 3 components (reasoning, confidence, data points)

---

## Scenario 4: Text-to-Speech Audio (7 min)

**Objective**: Verify audio playback works

**Steps**:
1. Brain icon should be ON (from previous scenario)
2. Locate the previous Grok response
3. Click speaker icon next to response (should show Volume2 icon)
4. Wait for audio to generate (progress: 1-2 seconds)
5. Audio should play automatically
6. Volume should be audible (check system volume)
7. Click speaker icon again to stop

**Expected Results**:
- ✅ Speaker icon appears next to message
- ✅ Clicking speaker triggers audio generation
- ✅ Audio generates within 2 seconds
- ✅ Audio plays without page reload
- ✅ Icon changes to VolumeX while playing
- ✅ Can stop audio by clicking again
- ✅ Natural-sounding voice
- ✅ No "audio not supported" errors

**Test Passed If**: Audio plays and stops correctly

---

## Scenario 5: Policy Information (5 min)

**Objective**: Test domain-specific responses

**Steps**:
1. Brain icon ON
2. Type: "What does my insurance policy cover?"
3. Submit
4. Review response and explanation
5. Click speaker to hear response

**Expected Results**:
- ✅ Grok provides policy guidance
- ✅ Response is domain-appropriate
- ✅ Explanation shows reasoning
- ✅ Audio plays successfully
- ✅ Response length: 2-4 sentences

**Test Passed If**: Receives policy-related information with explanation and audio

---

## Scenario 6: Disable Explanations (3 min)

**Objective**: Verify explanation mode can be toggled off

**Steps**:
1. Click brain icon again (should unhighlight)
2. Type: "How long does settlement usually take?"
3. Submit

**Expected Results**:
- ✅ Brain icon toggles OFF (no highlight)
- ✅ Response is still received
- ✅ NO explanation section appears below response
- ✅ Response appears faster (no parsing overhead)

**Test Passed If**: Response displayed without explanation section

---

## Scenario 7: Chat History (3 min)

**Objective**: Verify message history is maintained

**Steps**:
1. Review all messages in chat
2. Count messages from both user and Grok
3. Scroll up in chat to see earlier messages

**Expected Results**:
- ✅ All previous messages visible
- ✅ User messages on right (blue)
- ✅ Grok messages on left (gray)
- ✅ Messages in correct chronological order
- ✅ Smooth scrolling

**Test Passed If**: Complete message history displayed correctly

---

## Scenario 8: Analytics Dashboard (7 min)

**Objective**: Verify analytics visualization works

**Steps**:
1. Click sidebar (or navigate manually to `/app/analytics`)
2. Wait for page to load
3. Observe multiple charts:
   - Monthly Status Mix (stacked bars)
   - Settlement Days Trend (line chart)
   - Diagnosis Distribution (pie chart)
   - Top Diagnoses (horizontal bars)
   - Daily Claims (area chart)
4. Hover over chart elements
5. Try scrolling if chart is large

**Expected Results**:
- ✅ Page loads without errors
- ✅ All 5 charts render
- ✅ Charts show data
- ✅ Charts are interactive
- ✅ Tooltips appear on hover
- ✅ Colors are distinct and readable
- ✅ No console errors

**Test Passed If**: All charts display with data and are interactive

---

## Scenario 9: Integration Dashboard Testing (10 min)

**Objective**: Run automated integration tests

**Steps**:
1. Navigate to `/admin/integrations`
2. Click "Run Tests" button
3. Wait for all tests to complete
4. Review results:
   - Environment Variables
   - Grok AI Chat
   - Explainable AI
   - ElevenLabs TTS
   - Chat Widget Dependencies
   - Analytics Page
5. Click on each result to see details

**Expected Results**:
- ✅ All tests show "pass" status
- ✅ Green checkmarks visible
- ✅ Tests complete within 10 seconds
- ✅ No "fail" or "warning" statuses
- ✅ Details show success information

**Test Passed If**: All 6 tests pass without warnings or failures

---

## Scenario 10: Error Handling (5 min)

**Objective**: Verify graceful error handling

**Steps**:
1. Open browser DevTools Console
2. Chat, type something
3. Check console for errors
4. Try disabled features (if connectivity lost)
5. Verify app doesn't crash

**Expected Results**:
- ✅ No red error messages in console
- ✅ No uncaught exceptions
- ✅ User-friendly error messages (if any)
- ✅ App remains responsive
- ✅ debug messages visible if needed

**Test Passed If**: No critical errors, app handles issues gracefully

---

## Scenario 11: Mobile Responsiveness (5 min)

**Objective**: Test on smaller screens

**Steps**:
1. Open DevTools (F12)
2. Click device toolbar
3. Select Mobile (iPhone 12)
4. Refresh page
5. Test chat widget
6. Test analytics
7. Try opening integration dashboard

**Expected Results**:
- ✅ Chat widget displays properly
- ✅ Text is readable
- ✅ Buttons are clickable
- ✅ No horizontal scroll needed
- ✅ Charts responsive
- ✅ Touch interactions work

**Test Passed If**: All features work on mobile view

---

## Scenario 12: Performance Check (10 min)

**Objective**: Verify response times and performance

**Steps**:
1. Open DevTools Network tab
2. Send chat message - measure response time
3. Click speaker icon - measure audio generation time
4. Open analytics - measure load time
5. Open integration dashboard - measure load time

**Expected Results**:
- ✅ Chat response: < 3 seconds
- ✅ Audio generation: < 2 seconds
- ✅ Analytics load: < 2 seconds
- ✅ Dashboard load: < 1 second
- ✅ No failed requests
- ✅ No memory warnings

**Test Passed If**: All operations complete within acceptable times

---

## Quick Test Checklist

Use this for rapid verification:

- [ ] Chat responds
- [ ] Explanations toggle on/off
- [ ] Audio plays
- [ ] Analytics loads
- [ ] Integration tests pass
- [ ] Mobile view works
- [ ] No console errors
- [ ] Response times acceptable

---

## Troubleshooting Failed Tests

### Chat Not Responding
- Check XAI_API_KEY in environment
- Verify API key is valid in xAI dashboard
- Check network tab for 500 error
- Review server logs for [v0] errors

### Audio Not Playing
- Check ELEVENLABS_API_KEY in environment
- Verify browser allows audio playback
- Check system volume
- Try different browser (test compatibility)

### Explanation Not Showing
- Verify brain icon is ON
- Check response includes "Reasoning:" keyword
- Try more complex questions
- Inspect console for parsing errors

### Analytics Empty
- Ensure claims data exists in database
- Verify timestamp formats
- Check status values match expected values
- Try refreshing page

### Tests Failing
- Check all env vars are set
- Verify API keys are active
- Check internet connectivity
- Try running tests again

---

## Success Criteria

✅ **System is ready when**:
1. All 12 scenarios pass
2. No critical console errors
3. All integration tests pass
4. Response times are acceptable
5. Mobile view is functional
6. Features work as documented

---

## Reporting Issues

If any test fails:
1. Note the scenario number
2. Screenshot the error
3. Check console for [v0] messages
4. Check `/admin/integrations` for details
5. Review relevant documentation file

---

**Total Test Time**: ~75 minutes  
**Can be done in phases**: Yes, run scenarios 1-7 for core features, 8-12 for advanced features

**Last Updated**: 2026-02-08
