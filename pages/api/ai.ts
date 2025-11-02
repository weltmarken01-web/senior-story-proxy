import type { NextApiRequest, NextApiResponse } from 'next';

// Allow CORS for ChatGPT Canvas usage
function setCORS(res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCORS(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { model, prompt, tools, json } = req.body || {};

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY' });
    }

    // Forward to Anthropic Messages API
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-3-7-sonnet-20250219',
        max_tokens: 4096,
        messages: [{ role: 'user', content: String(prompt ?? '') }],
        tools: Array.isArray(tools) ? tools : undefined
      })
    });

    if (!upstream.ok) {
      const t = await upstream.text();
      return res.status(upstream.status).json({ error: t });
    }

    const data = await upstream.json();
    let text = '';
    if (Array.isArray((data as any)?.content)) {
      text = (data as any).content
        .filter((c: any) => c?.type === 'text')
        .map((c: any) => c.text)
        .join('\n');
    } else if ((data as any)?.content?.[0]?.text) {
      text = (data as any).content[0].text;
    } else {
      text = JSON.stringify(data);
    }

    return res.status(200).json({ text });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'proxy error' });
  }
}