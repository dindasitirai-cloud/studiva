import React from 'react';
import { FigureServeReturn }       from './FigureServeReturn';
import { FigureMotorSequence }     from './FigureMotorSequence';
import { FigureFocusDistance }     from './FigureFocusDistance';
import { FigureSafeSleepABC }      from './FigureSafeSleepABC';
import { FigureCauseEffect }       from './FigureCauseEffect';
import { FigureObjectPermanence }  from './FigureObjectPermanence';
import { FigureMpasiTexture }      from './FigureMpasiTexture';

type FigureComponent = React.FC;

export const FIGURE_REGISTRY: Record<string, FigureComponent> = {
  'serve-return':       FigureServeReturn,
  'motor-sequence':     FigureMotorSequence,
  'focus-distance':     FigureFocusDistance,
  'safe-sleep-abc':     FigureSafeSleepABC,
  'cause-effect':       FigureCauseEffect,
  'object-permanence':  FigureObjectPermanence,
  'mpasi-texture':      FigureMpasiTexture,
};
