import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CARDS, KnowledgeCard } from '../pages/DashboardPages/Tier2/knowledgeCardData';

export interface PlayerSegment {
  cardId: string;
  part: 'summary' | 'scientific';
}

interface AudioPlayerContextValue {
  segments: PlayerSegment[];
  setSegments: (segs: PlayerSegment[]) => void;
  currentIndex: number;
  setCurrentIndex: (idx: number) => void;
  isPlaying: boolean;
  play: (index?: number) => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  registerNavigate: (fn: (cardId: string, part: 'summary' | 'scientific') => void) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

function buildSummaryText(card: KnowledgeCard): string {
  return [
    card.title,
    'Yang biasa terjadi di usia ini.',
    card.summary.terjadi,
    'Kenapa penting.',
    card.summary.penting,
    'Yang bisa Anda lakukan.',
    card.summary.lakukan.join('. '),
    'Perlu perhatian bila.',
    card.summary.perhatian,
  ].join(' ');
}

function buildScientificText(card: KnowledgeCard): string {
  return [
    'Detail ilmiah.',
    card.scientific.title,
    card.scientific.paragraphs.join(' '),
  ].join(' ');
}

function getTextForSegment(seg: PlayerSegment): string {
  const card = CARDS.find(c => c.id === seg.cardId);
  if (!card) return '';
  return seg.part === 'summary' ? buildSummaryText(card) : buildScientificText(card);
}

function getIndonesianVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return voices.find(v => v.lang === 'id-ID') ?? voices.find(v => v.lang.startsWith('id')) ?? null;
}

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [segments, setSegmentsState] = useState<PlayerSegment[]>([]);
  const [currentIndex, setCurrentIndexState] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const navigateRef = useRef<((cardId: string, part: 'summary' | 'scientific') => void) | null>(null);
  const segmentsRef = useRef<PlayerSegment[]>(segments);
  const currentIndexRef = useRef(currentIndex);

  // Keep refs in sync
  segmentsRef.current = segments;
  currentIndexRef.current = currentIndex;

  const stopSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
  }, []);

  const speakSegment = useCallback((index: number) => {
    const segs = segmentsRef.current;
    if (index < 0 || index >= segs.length) {
      setIsPlaying(false);
      return;
    }
    stopSpeech();
    const seg = segs[index];
    const text = getTextForSegment(seg);
    if (!text) {
      setIsPlaying(false);
      return;
    }

    // TODO: premium TTS — replace Web Speech API with a paid TTS provider here

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.9;

    // Try to set Indonesian voice (voices may not be loaded immediately)
    const setVoice = () => {
      const voice = getIndonesianVoice();
      if (voice) utterance.voice = voice;
    };
    setVoice();
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', setVoice, { once: true });
    }

    utterance.onend = () => {
      const nextIdx = currentIndexRef.current + 1;
      if (nextIdx < segmentsRef.current.length) {
        setCurrentIndexState(nextIdx);
        currentIndexRef.current = nextIdx;
        const nextSeg = segmentsRef.current[nextIdx];
        navigateRef.current?.(nextSeg.cardId, nextSeg.part);
        speakSegment(nextIdx);
      } else {
        setIsPlaying(false);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  }, [stopSpeech]);

  const setSegments = useCallback((segs: PlayerSegment[]) => {
    stopSpeech();
    setIsPlaying(false);
    setSegmentsState(segs);
    segmentsRef.current = segs;
  }, [stopSpeech]);

  const setCurrentIndex = useCallback((idx: number) => {
    stopSpeech();
    setIsPlaying(false);
    setCurrentIndexState(idx);
    currentIndexRef.current = idx;
  }, [stopSpeech]);

  const play = useCallback((index?: number) => {
    const idx = index !== undefined ? index : currentIndexRef.current;
    setCurrentIndexState(idx);
    currentIndexRef.current = idx;
    speakSegment(idx);
  }, [speakSegment]);

  const pause = useCallback(() => {
    stopSpeech();
    setIsPlaying(false);
  }, [stopSpeech]);

  const next = useCallback(() => {
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx < segmentsRef.current.length) {
      stopSpeech();
      setCurrentIndexState(nextIdx);
      currentIndexRef.current = nextIdx;
      const seg = segmentsRef.current[nextIdx];
      navigateRef.current?.(seg.cardId, seg.part);
      speakSegment(nextIdx);
    }
  }, [stopSpeech, speakSegment]);

  const prev = useCallback(() => {
    const prevIdx = currentIndexRef.current - 1;
    if (prevIdx >= 0) {
      stopSpeech();
      setCurrentIndexState(prevIdx);
      currentIndexRef.current = prevIdx;
      const seg = segmentsRef.current[prevIdx];
      navigateRef.current?.(seg.cardId, seg.part);
      speakSegment(prevIdx);
    }
  }, [stopSpeech, speakSegment]);

  const registerNavigate = useCallback((fn: (cardId: string, part: 'summary' | 'scientific') => void) => {
    navigateRef.current = fn;
  }, []);

  return (
    <AudioPlayerContext.Provider value={{
      segments,
      setSegments,
      currentIndex,
      setCurrentIndex,
      isPlaying,
      play,
      pause,
      next,
      prev,
      registerNavigate,
    }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer(): AudioPlayerContextValue {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error('useAudioPlayer must be used inside AudioPlayerProvider');
  return ctx;
}
