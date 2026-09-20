// Rekah Journey — append-only event envelope + serialization boundary (Phase 9B-2)
// Wraps the Phase 9B-1 historical event types into one persisted stream. Serialization
// is explicit (domain <-> stored) so domain types never become database-dependent.
import type {
  TransitionEvent, ParentActionEvent, FocusEvent, ObservationEvent, ContentExposure,
  Adaptation, EngineDecision,
} from '../types';
import type { FamilyJourneyId, IdempotencyKey, IsoTimestamp } from '../ids';

/** The append-only events (Phase 9A §5). Reflection is a source record (editable) and is NOT here. */
export type JourneyEvent =
  | { readonly kind: 'TRANSITION'; readonly event: TransitionEvent }
  | { readonly kind: 'PARENT_ACTION'; readonly event: ParentActionEvent }
  | { readonly kind: 'FOCUS'; readonly event: FocusEvent }
  | { readonly kind: 'OBSERVATION'; readonly event: ObservationEvent }
  | { readonly kind: 'EXPOSURE'; readonly event: ContentExposure }
  | { readonly kind: 'ADAPTATION'; readonly event: Adaptation }
  | { readonly kind: 'ENGINE_DECISION'; readonly event: EngineDecision };

export type JourneyEventKind = JourneyEvent['kind'];

/** Persisted representation: a stored event carries stream ordering + audit envelope. */
export interface StoredEvent {
  readonly streamId: FamilyJourneyId;
  readonly sequence: number;             // monotonic per stream
  readonly kind: JourneyEventKind;
  readonly occurredAt: IsoTimestamp;
  readonly idempotencyKey: IdempotencyKey;
  readonly payloadJson: string;          // JSON-serialized domain event (nullability/enums/unions preserved)
}

/** Explicit domain -> stored conversion. */
export const serializeEvent = (
  streamId: FamilyJourneyId, sequence: number, occurredAt: IsoTimestamp,
  idempotencyKey: IdempotencyKey, ev: JourneyEvent,
): StoredEvent => ({
  streamId, sequence, kind: ev.kind, occurredAt, idempotencyKey,
  payloadJson: JSON.stringify(ev.event),
});

/** Explicit stored -> domain conversion (branded IDs are strings, so they survive round-trip). */
export const deserializeEvent = (s: StoredEvent): JourneyEvent => {
  const event = JSON.parse(s.payloadJson);
  switch (s.kind) {
    case 'TRANSITION': return { kind: 'TRANSITION', event };
    case 'PARENT_ACTION': return { kind: 'PARENT_ACTION', event };
    case 'FOCUS': return { kind: 'FOCUS', event };
    case 'OBSERVATION': return { kind: 'OBSERVATION', event };
    case 'EXPOSURE': return { kind: 'EXPOSURE', event };
    case 'ADAPTATION': return { kind: 'ADAPTATION', event };
    case 'ENGINE_DECISION': return { kind: 'ENGINE_DECISION', event };
  }
};

/** Recursively freeze a value so a persisted event cannot be mutated after append. */
export const deepFreeze = <T>(value: T): Readonly<T> => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const k of Object.keys(value as Record<string, unknown>)) {
      deepFreeze((value as Record<string, unknown>)[k]);
    }
  }
  return value;
};
