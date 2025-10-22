"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { LanguageSelect, LANGUAGES, type LanguageCode } from '../components/LanguageSelect';
import { Spinner } from '../components/Spinner';

type TranslationResponse = {
  translatedText: string;
  detectedSourceLang?: string;
  provider: string;
};

export default function Page() {
  const [sourceLang, setSourceLang] = useState<LanguageCode>('auto');
  const [targetLang, setTargetLang] = useState<LanguageCode>('es');
  const [text, setText] = useState('Hello! How are you?');
  const [translated, setTranslated] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canTranslate = useMemo(() => text.trim().length > 0 && targetLang !== 'auto', [text, targetLang]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!canTranslate) return;
    const handler = setTimeout(() => {
      translate();
    }, 400);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, sourceLang, targetLang]);

  async function translate() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, source: sourceLang, target: targetLang }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data: TranslationResponse = await res.json();
      setTranslated(data.translatedText);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      setError(err?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function swap() {
    if (sourceLang === 'auto') return;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setText(translated || text);
  }

  const detectedLabel = useMemo(() => {
    if (sourceLang !== 'auto') return null;
    if (!translated || loading || error) return null;
    return 'Detected';
  }, [sourceLang, translated, loading, error]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Translator</h1>
        <div className="text-sm text-gray-500">Privacy-friendly. Powered by public APIs.</div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
        <div>
          <LanguageSelect value={sourceLang} onChange={setSourceLang} label="From" />
        </div>
        <button
          onClick={swap}
          className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:scale-95"
          title="Swap"
        >
          ↔
        </button>
        <div>
          <LanguageSelect value={targetLang} onChange={setTargetLang} label="To" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type text here..."
          className="min-h-[180px] w-full resize-y rounded-md border border-gray-300 bg-white p-3 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
        <div className="min-h-[180px] rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
          {loading ? (
            <div className="flex h-full items-center justify-center"><Spinner /></div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <pre className="whitespace-pre-wrap break-words text-gray-900">{translated}</pre>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={translate}
          disabled={!canTranslate || loading}
          className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading && <Spinner />} Translate
        </button>
        <div className="text-xs text-gray-500">
          Languages: {LANGUAGES.length}. Open-source clients only.
        </div>
      </div>
    </main>
  );
}
