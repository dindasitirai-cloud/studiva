import React from 'react';
import { Trash2 } from 'lucide-react';
import { EntriJurnal } from '../data/mockJurnalData';
import PolaroidPhoto from './PolaroidPhoto';

const HIGHLIGHT_STYLE: Record<string, React.CSSProperties> = {
  pink:   { background: 'linear-gradient(transparent 62%, #f6bdd1 62% 92%, transparent 92%)' },
  yellow: { background: 'linear-gradient(transparent 62%, #f7d98b 62% 92%, transparent 92%)' },
  blue:   { background: 'linear-gradient(transparent 62%, #aad4f2 62% 92%, transparent 92%)' },
};

interface Props {
  entry: EntriJurnal;
  onDelete?: (id: string) => void;
  isUserCreated?: boolean;
}

export default function EntriJurnalCard({ entry, onDelete, isUserCreated }: Props) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <article
      className="relative mb-4"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <h3 className="font-caveat leading-tight" style={{ fontSize: 28, color: '#3a4a6b' }}>
        {entry.title}
      </h3>
      <div className="font-hand mb-2" style={{ fontSize: 14, color: '#7c88ab' }}>
        ✎ {entry.date}
      </div>
      <p className="font-hand leading-relaxed" style={{ fontSize: 16, color: '#3a4a6b', lineHeight: '26px' }}>
        {entry.segments.map((seg, i) =>
          seg.highlight ? (
            <span key={i} style={HIGHLIGHT_STYLE[seg.highlight]}>
              {seg.text}
            </span>
          ) : (
            <span key={i}>{seg.text}</span>
          ),
        )}
      </p>

      {entry.photo && <PolaroidPhoto photo={entry.photo} />}

      {isUserCreated && onDelete && hovered && (
        <button
          type="button"
          onClick={() => onDelete(entry.id)}
          aria-label={`Hapus entri: ${entry.title}`}
          className="absolute right-0 top-0 flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-400 transition hover:bg-red-100 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2} />
        </button>
      )}
    </article>
  );
}
