// Custom SVG avatar choices. Each name maps to a file in
// public/icons/<name>.svg (registered with MatIconRegistry in app.config.ts).
// The 'rp-' prefix is how templates know to render via [svgIcon] instead of
// a Material font ligature.
export const CUSTOM_PROFILE_ICONS: readonly string[] = [
  'rp-boulder',
  'rp-carabiner',
  'rp-climber',
  'rp-handstand',
  'rp-mountain',
  'rp-rope',
];

// Material icon (font ligature) avatar choices.
const MATERIAL_PROFILE_ICONS: readonly string[] = [
  'landscape',
  'hiking',
  'forest',
  'fitness_center',
  'sports_gymnastics',
  'self_improvement',
  'bolt',
  'local_fire_department',
  'ac_unit',
  'wb_sunny',
  'nights_stay',
  'pets',
  'anchor',
  'rocket_launch',
];

// All selectable avatar icons. Must stay in sync with PROFILE_ICONS in the
// backend (app/routers/users.py).
export const PROFILE_ICONS: readonly string[] = [
  ...MATERIAL_PROFILE_ICONS,
  ...CUSTOM_PROFILE_ICONS,
];

export function isCustomIcon(name: string): boolean {
  return name.startsWith('rp-');
}
