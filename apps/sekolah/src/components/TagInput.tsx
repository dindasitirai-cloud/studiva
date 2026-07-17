import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { CommunityTag } from '../types';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ value, onChange }: TagInputProps) {
  const [input, setInput] = useState('');
  const [popularTags, setPopularTags] = useState<CommunityTag[]>([]);

  useEffect(() => {
    api
      .get('/community/tags')
      .then(({ data }) => setPopularTags(data.tags))
      .catch(() => setPopularTags([]));
  }, []);

  function addTag(raw: string) {
    const tag = raw.trim().replace(/^#/, '');
    if (!tag) return;
    const formatted = `#${tag}`;
    if (value.includes(formatted) || value.length >= 8) return;
    onChange([...value, formatted]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
      setInput('');
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div>
      <div className="flex min-h-[48px] flex-wrap items-center gap-2 rounded-md border border-bordergray px-3 py-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-skyblue/15 px-3 py-1 text-sm font-medium text-navy"
          >
            {tag}
            <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
              ✕
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? 'Tambahkan tag, tekan Enter (e.g. SensoryIssues)' : ''}
          className="min-w-[140px] flex-1 border-none p-1 outline-none"
        />
      </div>

      {popularTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="text-xs text-textlight">Popular:</span>
          {popularTags.slice(0, 8).map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => addTag(tag.name)}
              className="text-xs font-medium text-skyblue hover:underline"
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
