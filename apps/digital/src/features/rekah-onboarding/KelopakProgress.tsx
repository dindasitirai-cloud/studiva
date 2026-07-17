import React from 'react';

interface Props {
  totalSteps?: number;
  currentStep: number;
}

// Five petal-shaped divs arranged in a fan — fills left-to-right as steps complete.
export default function KelopakProgress({ totalSteps = 5, currentStep }: Props) {
  const rotations = [-30, -15, 0, 15, 30];

  return (
    <div
      className="flex items-end justify-center gap-1.5"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Langkah ${currentStep} dari ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }, (_, i) => {
        const filled = i + 1 <= currentStep;
        return (
          <div
            key={i}
            style={{
              width: 14,
              height: 22,
              borderRadius: '70% 70% 70% 4px',
              transform: `rotate(${rotations[i]}deg)`,
              transition: 'background 0.25s ease, border-color 0.25s ease',
            }}
            className={
              filled
                ? 'bg-rekah border-2 border-rekah'
                : 'bg-transparent border-2 border-rekah/25'
            }
          />
        );
      })}
    </div>
  );
}
