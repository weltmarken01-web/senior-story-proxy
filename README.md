# Senior Story Proxy (Vercel / Next.js API)

A tiny proxy that forwards requests from your front-end to Anthropic Messages API
so your API key stays on the server.

## 0) Requirements
- Node 18+
- A Vercel account (or any platform that runs Next.js serverless functions)
- Your Anthropic API key

## 1) Local dev (optional)
```bash
npm i
ANOTHER_DOTENV=not-used
# For local dev, create .env.local with ANTHROPIC_API_KEY=...
npm run dev
```

Create `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

## 2) Deploy to Vercel
- Push this folder to a Git repo (GitHub).
- Import the repo in Vercel.
- In **Vercel > Project > Settings > Environment Variables** add:
  - `ANTHROPIC_API_KEY` = your key
- Deploy.

The endpoint will be:
```
https://<your-vercel-domain>/api/ai
```

## 3) CORS
This route sets:
```
Access-Control-Allow-Origin: *
```
so you can call it from ChatGPT Canvas.

## 4) Call format
POST `/api/ai`
```json
{
  "model": "claude-3-7-sonnet-20250219",
  "prompt": "your prompt text",
  "tools": [{ "name": "web_search" }],
  "json": true
}
```

**Response**
```json
{ "text": "model response text..." }
```

## 5) Quick test
```bash
curl -X POST https://<your-vercel-domain>/api/ai \  -H 'content-type: application/json' \  -d '{ "model":"claude-3-7-sonnet-20250219", "prompt":"ping" }'
```

Now paste the endpoint URL into your Canvas app's **API URL** field and turn **Mock 모드** OFF.