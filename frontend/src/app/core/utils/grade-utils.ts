export interface GradeOption {
  value: string;
  label: string;
}

// V grade → Fontainebleau equivalent (shown as range when the V grade spans two font grades)
const V_FONT: Record<string, string> = {
  VB:  '3',      V0:  '4',      V1:  '5',      V2:  '5+',
  V3:  '6a-6a+', V4:  '6b-6b+', V5:  '6c-6c+',
  V6:  '7a',     V7:  '7a+',
  V8:  '7b-7b+', V9:  '7c-7c+',
  V10: '7c+',    V11: '8a',     V12: '8a+',
  V13: '8b',     V14: '8b+',    V15: '8c',
  V16: '8c+',    V17: '9a',
};

// YDS grade → Fontainebleau equivalent (individual grade, not a range)
const YDS_FONT: Record<string, string> = {
  '5.5':   '3',    '5.6':   '3',
  '5.7':   '4',    '5.8':   '4',
  '5.9':   '5',
  '5.10a': '5+',   '5.10b': '5+',
  '5.10c': '6a',   '5.10d': '6a+',
  '5.11a': '6b',   '5.11b': '6b+',
  '5.11c': '6c',   '5.11d': '6c+',
  '5.12a': '7a',   '5.12b': '7a',
  '5.12c': '7a+',  '5.12d': '7a+',
  '5.13a': '7b',   '5.13b': '7b+',
  '5.13c': '7c',   '5.13d': '7c+',
  '5.14a': '7c+',  '5.14b': '8a',
  '5.14c': '8a+',  '5.14d': '8b',
  '5.15a': '8b+',  '5.15b': '8c',
  '5.15c': '8c+',  '5.15d': '9a',
};

export function gradeWithFont(grade: string): string {
  if (!grade || grade === '—') return grade;
  const font = grade.startsWith('V') ? V_FONT[grade] : YDS_FONT[grade];
  return font ? `${grade} / ${font}` : grade;
}

const V_VALUES = ['VB', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8',
                  'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17'];

const YDS_VALUES = [
  '5.1', '5.2', '5.3', '5.4',
  '5.5', '5.6', '5.7', '5.8', '5.9',
  '5.10a', '5.10b', '5.10c', '5.10d',
  '5.11a', '5.11b', '5.11c', '5.11d',
  '5.12a', '5.12b', '5.12c', '5.12d',
  '5.13a', '5.13b', '5.13c', '5.13d',
  '5.14a', '5.14b', '5.14c', '5.14d',
  '5.15a', '5.15b', '5.15c', '5.15d',
];

export const V_GRADES: GradeOption[] = V_VALUES.map(v => ({ value: v, label: gradeWithFont(v) }));
export const YDS_GRADES: GradeOption[] = YDS_VALUES.map(y => ({ value: y, label: gradeWithFont(y) }));
