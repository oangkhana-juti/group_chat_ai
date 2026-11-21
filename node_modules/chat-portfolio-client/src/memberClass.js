const FALLBACK_CLASSES = [
  {
    th: 'จอมเวทย์ผู้ร่ายภาพลวงตา',
    en: 'Illusion-Weaving Sorcerer',
  },
  {
    th: 'จอมเวทย์ผู้ผูกพลัง AI',
    en: 'AI-Binding Sorcerer',
  },
  {
    th: 'จอมเวทย์ผู้พิทักษ์ห้องสมุดข้อมูล',
    en: 'Keeper of the Data Archive',
  },
];

export function getMemberClass(member, index, language) {
  const value = member.magicClass;
  if (typeof value === 'string' && value.trim()) return value;
  if (value && typeof value === 'object') {
    const localized = value[language] || value.th || value.en;
    if (typeof localized === 'string' && localized.trim()) return localized;
  }
  const fallback = FALLBACK_CLASSES[index % FALLBACK_CLASSES.length];
  return fallback[language] || fallback.th;
}
