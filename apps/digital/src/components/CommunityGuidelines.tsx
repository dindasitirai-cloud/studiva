import React from 'react';
import Card from './Card';

const DOS = [
  'Be respectful & kind',
  'Share personal experiences',
  'Ask for advice',
  'Celebrate wins',
  'Use tags to help others',
  'Report problems',
];

const DONTS = [
  'Spam or promote products',
  'Give medical diagnoses',
  'Discriminate or bully',
  'Share confidential info',
  'Post only for self-promotion',
];

export default function CommunityGuidelines() {
  return (
    <Card>
      <h3 className="text-h3 font-semibold text-navy">Community Guidelines</h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="font-semibold text-success">✅ DO</p>
          <ul className="mt-1 space-y-1 text-sm text-textdark">
            {DOS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-red-600">❌ DON&apos;T</p>
          <ul className="mt-1 space-y-1 text-sm text-textdark">
            {DONTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
