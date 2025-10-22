"use client";

import { useId } from 'react';

const LANGUAGES = [
  { code: 'auto', label: 'Detect language' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hi', label: 'Hindi' },
];

export type LanguageCode = typeof LANGUAGES[number]['code'];

export function LanguageSelect({ value, onChange, label }: {
  value: LanguageCode;
  onChange: (v: LanguageCode) => void;
  label: string;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as LanguageCode)}
        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </label>
  );
}

export { LANGUAGES };
