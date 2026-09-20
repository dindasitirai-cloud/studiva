// Rekah Journey — Observation Prompt Library (Phase 10G, Track A). ADDITIVE.
// A projection of the FROZEN content's OWN canonical (developmentDomain, capability, age band) tags.
// The parent reports a real, observable behaviour; each prompt carries the EXACT canonical
// domainOrArea/capabilityOrTopic that existing AJAK_MAIN content already declares — so NO developmental
// relationship is invented (the tag is the frozen content's; only the parent-facing wording is app copy).
// A parent-picked prompt becomes a PARENT_OBSERVATION → the frozen resolveFocus proposes a
// SYSTEM_SUGGESTED focus on that capability → the frozen selectContent finds the matching content.
export interface ObservationPrompt {
  readonly id: string;
  readonly domainOrArea: string;      // canonical DevelopmentDomain (copied from frozen content)
  readonly capabilityOrTopic: string; // canonical capability (copied from frozen content)
  readonly ageMinMonths: number;
  readonly ageMaxMonths: number;
  readonly label: string;             // parent-facing (UI copy — review by Rekah content team)
  readonly hint?: string;
}

// Tags below are COPIED VERBATIM from buildAllDescriptors() AJAK_MAIN (domain, capability, age span).
export const OBSERVATION_PROMPTS: readonly ObservationPrompt[] = [
  { id: 'obs-grossmotor-locomotion', domainOrArea: 'Gross Motor', capabilityOrTopic: 'Locomotion and Moving Through Space', ageMinMonths: 0, ageMaxMonths: 18, label: 'Mulai bergerak menjelajah', hint: 'Berguling, merayap, merangkak, atau melangkah ke tempat baru.' },
  { id: 'obs-grossmotor-postural', domainOrArea: 'Gross Motor', capabilityOrTopic: 'Trunk and Postural Control', ageMinMonths: 0, ageMaxMonths: 6, label: 'Menahan kepala & badan', hint: 'Mulai tengkurap, menahan kepala, atau duduk dibantu.' },
  { id: 'obs-cognitive-objperm', domainOrArea: 'Cognitive', capabilityOrTopic: 'Object Permanence and Memory', ageMinMonths: 0, ageMaxMonths: 18, label: 'Mencari benda yang hilang', hint: 'Mencari mainan yang ditutup kain atau jatuh dari pandangan.' },
  { id: 'obs-cognitive-causeeffect', domainOrArea: 'Cognitive', capabilityOrTopic: 'Cause-and-Effect Understanding', ageMinMonths: 7, ageMaxMonths: 12, label: 'Suka sebab-akibat', hint: 'Menekan tombol, menjatuhkan benda untuk melihat apa yang terjadi.' },
  { id: 'obs-cognitive-pretend', domainOrArea: 'Cognitive', capabilityOrTopic: 'Symbolic and Pretend Thinking', ageMinMonths: 19, ageMaxMonths: 36, label: 'Bermain pura-pura', hint: 'Menyuapi boneka, pura-pura menelepon, meniru kegiatan sehari-hari.' },
  { id: 'obs-cognitive-problem', domainOrArea: 'Cognitive', capabilityOrTopic: 'Problem Solving', ageMinMonths: 19, ageMaxMonths: 36, label: 'Mencoba memecahkan masalah', hint: 'Mencari cara mengambil benda atau menyusun sesuatu.' },
  { id: 'obs-finemotor-grasp', domainOrArea: 'Fine Motor', capabilityOrTopic: 'Grasping and Reaching', ageMinMonths: 0, ageMaxMonths: 6, label: 'Meraih & menggenggam', hint: 'Menggapai dan memegang benda kecil.' },
  { id: 'obs-finemotor-manip', domainOrArea: 'Fine Motor', capabilityOrTopic: 'Manipulating Objects', ageMinMonths: 13, ageMaxMonths: 24, label: 'Memainkan benda dengan jari', hint: 'Menyusun, memasukkan, membalik benda dengan tangan.' },
  { id: 'obs-finemotor-markmaking', domainOrArea: 'Fine Motor', capabilityOrTopic: 'Early Mark-Making and Drawing', ageMinMonths: 7, ageMaxMonths: 36, label: 'Mulai mencoret', hint: 'Memegang krayon dan membuat coretan.' },
  { id: 'obs-lang-gesture', domainOrArea: 'Language & Communication', capabilityOrTopic: 'Gestures and Nonverbal Communication', ageMinMonths: 7, ageMaxMonths: 18, label: 'Berkomunikasi dengan isyarat', hint: 'Menunjuk, melambai, atau mengangkat tangan minta gendong.' },
  { id: 'obs-lang-expressive', domainOrArea: 'Language & Communication', capabilityOrTopic: 'Expressive Communication', ageMinMonths: 0, ageMaxMonths: 24, label: 'Mengeluarkan suara & kata', hint: 'Mengoceh, meniru bunyi, atau mulai berkata.' },
  { id: 'obs-lang-story', domainOrArea: 'Language & Communication', capabilityOrTopic: 'Early Literacy and Storytelling', ageMinMonths: 7, ageMaxMonths: 36, label: 'Tertarik pada buku & cerita', hint: 'Menunjuk gambar, ingin dibacakan berulang.' },
  { id: 'obs-se-attachment', domainOrArea: 'Social-Emotional', capabilityOrTopic: 'Attachment and Secure Relationship', ageMinMonths: 0, ageMaxMonths: 12, label: 'Mencari kedekatan', hint: 'Tenang saat digendong, mencari Ibu saat cemas.' },
  { id: 'obs-se-empathy', domainOrArea: 'Social-Emotional', capabilityOrTopic: 'Empathy and Understanding Others', ageMinMonths: 0, ageMaxMonths: 36, label: 'Peka pada perasaan orang', hint: 'Ikut sedih saat orang lain menangis, menghibur.' },
  { id: 'obs-se-play', domainOrArea: 'Social-Emotional', capabilityOrTopic: 'Social Interaction and Play with Others', ageMinMonths: 7, ageMaxMonths: 36, label: 'Bermain bersama orang lain', hint: 'Bergiliran, meniru, menikmati main bersama.' },
  { id: 'obs-se-autonomy', domainOrArea: 'Social-Emotional', capabilityOrTopic: 'Autonomy and Sense of Agency', ageMinMonths: 19, ageMaxMonths: 36, label: 'Ingin melakukan sendiri', hint: '"Aku bisa sendiri" — memakai baju, makan sendiri.' },
  { id: 'obs-selfreg-emotion', domainOrArea: 'Self-Regulation & Executive Function', capabilityOrTopic: 'Emotional Regulation', ageMinMonths: 7, ageMaxMonths: 36, label: 'Belajar menenangkan diri', hint: 'Mulai bisa reda setelah kecewa, dengan pendampingan.' },
  { id: 'obs-selfreg-impulse', domainOrArea: 'Self-Regulation & Executive Function', capabilityOrTopic: 'Impulse Control and Waiting', ageMinMonths: 19, ageMaxMonths: 36, label: 'Belajar menunggu', hint: 'Mulai bisa menunggu giliran sebentar.' },
  { id: 'obs-selfreg-choice', domainOrArea: 'Self-Regulation & Executive Function', capabilityOrTopic: 'Decision-Making and Choice-Making', ageMinMonths: 7, ageMaxMonths: 36, label: 'Membuat pilihan', hint: 'Memilih antara dua hal yang ditawarkan.' },
  { id: 'obs-adaptive-selffeed', domainOrArea: 'Adaptive / Self-Help', capabilityOrTopic: 'Self-Feeding', ageMinMonths: 13, ageMaxMonths: 36, label: 'Makan sendiri', hint: 'Memegang sendok atau makan dengan tangan sendiri.' },
  { id: 'obs-adaptive-independence', domainOrArea: 'Adaptive / Self-Help', capabilityOrTopic: 'Growing Independence in Daily Tasks', ageMinMonths: 13, ageMaxMonths: 24, label: 'Ikut membantu kegiatan harian', hint: 'Membantu merapikan, memakai kaus kaki, dll.' },
];

/** Prompts whose canonical age span covers the child's age in months. Pure, deterministic. */
export function promptsForAge(ageMonths: number | null): readonly ObservationPrompt[] {
  if (ageMonths == null) return OBSERVATION_PROMPTS;
  return OBSERVATION_PROMPTS.filter((p) => ageMonths >= p.ageMinMonths && ageMonths <= p.ageMaxMonths);
}
export function promptById(id: string): ObservationPrompt | null {
  return OBSERVATION_PROMPTS.find((p) => p.id === id) ?? null;
}
