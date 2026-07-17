import { useDashboardTier2, ChildProfile } from '../../context/DashboardTier2Context';

interface ActivityChildResolution {
  /** Exactly one child to silently attribute activity to, no picker needed. */
  singleChild: { id: string; name: string } | null;
  /** Only non-empty when the parent has 2+ Tier 2 child profiles and must pick. */
  pickerChildren: ChildProfile[];
}

// Resolves "which child does this article/course/strategy activity belong to?"
// Digital has only Tier 2 parents: 0 children → prompt to add, 1 → auto-attribute,
// 2+ → show ChildPicker.
export function useActivityChild(): ActivityChildResolution {
  const { children } = useDashboardTier2();

  if (children.length === 1) {
    return { singleChild: { id: children[0].id, name: children[0].name }, pickerChildren: [] };
  }
  return { singleChild: null, pickerChildren: children };
}
