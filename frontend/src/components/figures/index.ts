import React from 'react';
import { FigureServeReturn }          from './FigureServeReturn';
import { FigureMotorSequence }        from './FigureMotorSequence';
import { FigureFocusDistance }        from './FigureFocusDistance';
import { FigureSafeSleepABC }         from './FigureSafeSleepABC';
import { FigureCauseEffect }          from './FigureCauseEffect';
import { FigureObjectPermanence }     from './FigureObjectPermanence';
import { FigureMpasiTexture }         from './FigureMpasiTexture';
import { FigureJointAttention }       from './FigureJointAttention';
// Batch 3-4y (2026-07)
import { FigureExecutiveFunction }    from './FigureExecutiveFunction';
import { FigurePreLiteracyPath }      from './FigurePreLiteracyPath';
import { FigureTemperamentFit }       from './FigureTemperamentFit';
import { FigureGrowthCurve }          from './FigureGrowthCurve';
import { FigurePraiseProcess }        from './FigurePraiseProcess';
import { FigureInjuryByAge }          from './FigureInjuryByAge';
// Batch 4-5y (2026-07)
import { FigureSchoolReadinessDomains } from './FigureSchoolReadinessDomains';
import { FigureTheoryOfMind }           from './FigureTheoryOfMind';
import { FigurePracticalLife }          from './FigurePracticalLife';
// Batch DK-1 (2026-07)
import { FigureJalurLayanan }       from './FigureJalurLayanan';
import { FigureSkrinBukanVonis }    from './FigureSkrinBukanVonis';
import { FigureSpektrum }           from './FigureSpektrum';
// Batch DK-2 (2026-07)
import { FigureSensorikHiperHipo }  from './FigureSensorikHiperHipo';

type FigureComponent = React.FC;

export const FIGURE_REGISTRY: Record<string, FigureComponent> = {
  'serve-return':         FigureServeReturn,
  'motor-sequence':       FigureMotorSequence,
  'focus-distance':       FigureFocusDistance,
  'safe-sleep-abc':       FigureSafeSleepABC,
  'cause-effect':         FigureCauseEffect,
  'object-permanence':    FigureObjectPermanence,
  'mpasi-texture':        FigureMpasiTexture,
  'joint-attention':      FigureJointAttention,
  // Batch 3-4y
  'executive-function':        FigureExecutiveFunction,
  'pre-literacy-path':         FigurePreLiteracyPath,
  'temperament-fit':           FigureTemperamentFit,
  'growth-curve':              FigureGrowthCurve,
  'praise-process':            FigurePraiseProcess,
  'injury-by-age':             FigureInjuryByAge,
  // Batch 4-5y
  'school-readiness-domains':  FigureSchoolReadinessDomains,
  'theory-of-mind':            FigureTheoryOfMind,
  'practical-life':            FigurePracticalLife,
  // Batch DK-1
  'jalur-layanan':         FigureJalurLayanan,
  'skrining-bukan-vonis':  FigureSkrinBukanVonis,
  'spektrum':              FigureSpektrum,
  // Batch DK-2
  'sensorik-hiper-hipo':   FigureSensorikHiperHipo,
};
