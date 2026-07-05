import React from 'react';
import { FigureServeReturn } from './FigureServeReturn';

type FigureComponent = React.FC;

export const FIGURE_REGISTRY: Record<string, FigureComponent> = {
  'serve-return': FigureServeReturn,
  // Add more figures here as content grows, e.g.:
  // 'brain-timeline': FigureBrainTimeline,
};
