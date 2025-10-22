import { NextRequest, NextResponse } from 'next/server';

// Simple translation via MyMemory free API
// Docs: https://mymemory.translated.net/doc/spec.php

type Body = {
  q: string;
  source?: string; // 'auto' supported by upstream
  target: string;
};

type MyMemoryResp = {
  responseData: { translatedText: string; match?: number };
  responseStatus: number;
  matches?: Array<{ translation: string; quality?: string; }>
};

function mapLang(code?: string) {
  if (!code) return undefined;
  // MyMemory expects ISO codes; pass-through known values
  return code;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body;
  if (!body?.q || !body?.target) {
    return NextResponse.json({ error: 'Missing q or target' }, { status: 400 });
  }

  const source = body.source && body.source !== 'auto' ? mapLang(body.source) : undefined;
  const target = mapLang(body.target);

  const params = new URLSearchParams({
    q: body.q,
    langpair: `${source ?? 'auto'}|${target}`,
    de: 'example@example.com'
  });

  const url = `https://api.mymemory.translated.net/get?${params.toString()}`;

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) {
      return NextResponse.json({ error: `Upstream failed: ${res.status}` }, { status: 502 });
    }
    const data = (await res.json()) as MyMemoryResp;

    if (!data.responseData?.translatedText) {
      return NextResponse.json({ error: 'No translation returned' }, { status: 502 });
    }

    return NextResponse.json({
      translatedText: data.responseData.translatedText,
      provider: 'mymemory'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
