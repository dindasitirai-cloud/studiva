import { useDashboardBasePath } from './useDashboardBasePath';
import { useDashboardTier1Optional } from './Tier1/DashboardTier1Context';
import { useDashboardTier2, ChildProfile } from '../../context/DashboardTier2Context';

interface ActivityChildResolution {
  /** Exactly one child to silently attribute activity to, no picker needed. */
  singleChild: { id: string; name: string } | null;
  /** Only non-empty when the parent has 2+ Tier 2 child profiles and must pick. */
  pickerChildren: ChildProfile[];
}

// Resolves "which child does this article/course/strategy activity belong
// to?" for the shared Studiva Digital pages. Tier 1 (Sekolah Studiva) parents
// have exactly one school-managed child (from DashboardTier1Context) and are
// never asked to pick - it's always that child. Tier 2 parents keep the
// original behavior: 0 children -> prompt to add one, 1 -> auto-attribute
// silently, 2+ -> show ChildPicker.
export function useActivityChild(): ActivityChildResolution {
  const basePath = useDashboardBasePath();
  const tier1 = useDashboardTier1Optional();
  const { children } = useDashboardTier2();

  if (basePath === '/dashboard/tier1' && tier1) {
    return { singleChild: { id: tier1.child.id, name: tier1.child.name }, pickerChildren: [] };
  }
  if (children.length === 1) {
    return { singleChild: { id: children[0].id, name: children[0].name }, pickerChildren: [] };
  }
  return { singleChild: null, pickerChildren: children };
}
