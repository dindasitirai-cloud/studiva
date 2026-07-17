import React from 'react';
import Card from './Card';
import { formatIDR } from '../lib/pricing';

interface ConsultationTypeCardProps {
  icon: string;
  title: string;
  description: string;
  benefits: string[];
  duration: number;
  price: number;
  selected: boolean;
  onSelect: () => void;
}

export default function ConsultationTypeCard({
  icon,
  title,
  description,
  benefits,
  duration,
  price,
  selected,
  onSelect,
}: ConsultationTypeCardProps) {
  return (
    <Card
      className={`flex cursor-pointer flex-col transition ${
        selected ? 'border-2 border-gold' : 'border border-bordergray'
      }`}
    >
      <button onClick={onSelect} className="flex flex-1 flex-col text-left">
        <div className="text-4xl">{icon}</div>
        <h3 className="mt-2 text-h3 font-bold text-navy">{title}</h3>
        <p className="mt-1 text-textlight">{description}</p>
        <ul className="mt-4 flex-1 space-y-2">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-2 text-textdark">
              <span className="text-success">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-textlight">{duration} menit session</p>
        <p className="mt-1 text-xl font-bold text-navy">{formatIDR(price)}</p>
      </button>
    </Card>
  );
}
