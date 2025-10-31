# ⚙️ Trip Builder Streaming Fix: Unexpected end of JSON input

**Issue Summary:**  
After implementing Server-Sent Events (SSE) streaming for Gemini output, the Trip Builder now fails after ~30 seconds with:

```
Error parsing stream data: Unexpected end of JSON input
```

This happens because the backend stream closes before completing the full JSON payload — the connection ends mid-response. The frontend then attempts to `JSON.parse()` an incomplete string, resulting in the error.

---

## 🧩 Root Cause

| Previous State | Current State | Problem |
|----------------|----------------|----------|
| Full synchronous request (worked fine but slow) | SSE-based streaming using `generateContentStream` | Stream closes prematurely before JSON is complete |

**Why it breaks:**  
- The Gemini stream does not always send a closing delimiter.  
- The `for await...of` loop ends before all chunks are received.  
- `writer.close()` executes early, cutting the final payload.  
- The accumulated buffer is incomplete, so `JSON.parse()` throws `Unexpected end of JSON input`.

---

## ✅ Fix Strategy: Safe Stream Closure and Hybrid SSE

Instead of trying to parse JSON in real-time, we **stream only progress** and **finalize the complete output** after the model finishes.

---

### 1. Stream Progress Updates Only

```ts
const encoder = new TextEncoder();
const stream = new TransformStream();
const writer = stream.writable.getWriter();

(async () => {
  try {
    await writer.write(encoder.encode(`data: ${JSON.stringify({
      status: 'analyzing',
      message: 'Analyzing your trip requirements...'
    })}\n\n`));

    const result = await model.generateContentStream(prompt);
    let buffer = '';

    for await (const chunk of result.stream) {
      const text = chunk.text();
      buffer += text;

      // Send progress events
      await writer.write(encoder.encode(`data: ${JSON.stringify({
        status: 'generating',
        message: text.trim().slice(-80),
        progress: Math.min(95, (buffer.length / 4000) * 100)
      })}\n\n`));
    }

    // Ensure final parsing happens only when stream is done
    let itinerary;
    try {
      itinerary = JSON.parse(cleanJsonResponse(buffer));
    } catch (err) {
      console.error('Incomplete output, fallback triggered:', err);
      await writer.write(encoder.encode(`data: ${JSON.stringify({
        status: 'error',
        message: 'Incomplete model output — please retry.'
      })}\n\n`));
      return;
    }

    await writer.write(encoder.encode(`data: ${JSON.stringify({
      status: 'complete',
      itinerary
    })}\n\n`));

  } finally {
    console.log('[TripBuilder] Stream complete.');
    await writer.close();
  }
})();

return new Response(stream.readable, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  },
});
```

---

### 2. Optional: Timeout Guard (60 seconds)

To avoid hanging streams if Gemini stalls:

```ts
const timeout = setTimeout(async () => {
  console.warn('Trip Builder stream timeout, closing early.');
  await writer.close();
}, 60000);

try {
  // ... stream loop here ...
} finally {
  clearTimeout(timeout);
}
```

---

### 3. Optional: Hybrid SSE + Final Fetch

If Gemini output remains large or unreliable in streaming mode, use this hybrid pattern:

1. Stream only progress updates (`status`, `message`, `progress`).
2. Write final model output to Supabase or file storage.
3. Client polls or fetches final JSON via `/api/trip-builder/result?id=XYZ`.

This guarantees stable JSON parsing while keeping UX responsive.

---

## 🧠 Why This Works

| Problem | Solution |
|----------|-----------|
| Gemini stream ends abruptly | Only parse JSON once model signals stop |
| Premature `writer.close()` | Move close to final completion or timeout |
| Truncated JSON | Accumulate safely, then `JSON.parse()` once |
| Perceived slowness | Stream progress text to UI during generation |

---

## 🧾 Next Steps

1. Replace your existing `/api/travel-planner/route.ts` loop with this safe-stream version.
2. Add `console.log` traces to confirm stream closes *after* final write.
3. Validate that client receives final `status: complete` event.
4. Optionally, implement the Hybrid SSE + Final Fetch model for maximum reliability.

---

**Prepared for:** WC26 Fan Zone Dev Team  
**Date:** October 31, 2025  
**Author:** Manus AI  
