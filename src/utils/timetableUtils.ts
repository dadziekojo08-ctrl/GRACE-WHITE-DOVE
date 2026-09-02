// Timetable Utility Helpers for Lesson Scheduling, Time Parsing & Subject Management

export interface ParsedTimeSlot {
  startTime: string; // e.g. "08:00"
  endTime: string;   // e.g. "08:50"
  durationMinutes: number;
}

export const STANDARD_TIME_SLOTS = [
  '08:00 - 08:50', // Period 1
  '08:50 - 09:40', // Period 2
  '09:40 - 10:30', // Period 3
  '10:30 - 11:00', // Snack / Recess Break
  '11:00 - 11:50', // Period 4
  '11:50 - 12:40', // Period 5
  '12:40 - 13:30', // Midday Lunch Break
  '13:30 - 14:20', // Period 6
  '14:20 - 15:10'  // Period 7 / Closing Assembly
];

export const STANDARD_PERIOD_PRESETS = [
  { label: 'Period 1 (08:00 - 08:50)', startTime: '08:00', endTime: '08:50', isBreak: false },
  { label: 'Period 2 (08:50 - 09:40)', startTime: '08:50', endTime: '09:40', isBreak: false },
  { label: 'Period 3 (09:40 - 10:30)', startTime: '09:40', endTime: '10:30', isBreak: false },
  { label: 'Morning Snack Break (10:30 - 11:00)', startTime: '10:30', endTime: '11:00', isBreak: true },
  { label: 'Period 4 (11:00 - 11:50)', startTime: '11:00', endTime: '11:50', isBreak: false },
  { label: 'Period 5 (11:50 - 12:40)', startTime: '11:50', endTime: '12:40', isBreak: false },
  { label: 'Midday Lunch Break (12:40 - 13:30)', startTime: '12:40', endTime: '13:30', isBreak: true },
  { label: 'Period 6 (13:30 - 14:20)', startTime: '13:30', endTime: '14:20', isBreak: false },
  { label: 'Period 7 (14:20 - 15:10)', startTime: '14:20', endTime: '15:10', isBreak: false },
];

export const POPULAR_GHANA_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Integrated Science',
  'Social Studies',
  'Computing (ICT)',
  'Religious & Moral Education (RME)',
  'Creative Arts & Design',
  'Ghanaian Language (Twi/Fante/Ga)',
  'French',
  'Physical & Health Education (PE)',
  'Our World Our People',
  'History of Ghana',
  'Career Technology',
  'Phonics & Reading',
  'Numeracy & Counting',
  'Rhymes & Music',
  'Handwriting & Spelling',
  'Free Play & Games'
];

/**
 * Parse a string slot like "08:00 - 08:50" or "8:00 AM - 8:50 AM" into standard 24h format
 */
export function parseTimeSlot(slot: string): ParsedTimeSlot {
  if (!slot) {
    return { startTime: '08:00', endTime: '08:50', durationMinutes: 50 };
  }

  const parts = slot.split('-').map(s => s.trim());
  let startTime = '08:00';
  let endTime = '08:50';

  if (parts.length >= 2) {
    const rawStart = parts[0];
    const rawEnd = parts[1];

    // Extract HH:mm from raw start
    const startMatch = rawStart.match(/(\d{1,2}):(\d{2})/);
    if (startMatch) {
      startTime = `${startMatch[1].padStart(2, '0')}:${startMatch[2]}`;
    }

    // Extract HH:mm from raw end
    const endMatch = rawEnd.match(/(\d{1,2}):(\d{2})/);
    if (endMatch) {
      endTime = `${endMatch[1].padStart(2, '0')}:${endMatch[2]}`;
    }
  }

  const durationMinutes = calculateDurationMinutes(startTime, endTime);
  return { startTime, endTime, durationMinutes };
}

/**
 * Calculate duration between two "HH:mm" time strings
 */
export function calculateDurationMinutes(startTime: string, endTime: string): number {
  const [h1, m1] = (startTime || '08:00').split(':').map(Number);
  const [h2, m2] = (endTime || '08:50').split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 50;

  const totalMin1 = h1 * 60 + m1;
  const totalMin2 = h2 * 60 + m2;
  const diff = totalMin2 - totalMin1;
  return diff > 0 ? diff : 50;
}

/**
 * Add specified minutes to a "HH:mm" time string
 */
export function addMinutesToTime(timeStr: string, minutes: number): string {
  const [hStr, mStr] = (timeStr || '08:00').split(':');
  let h = parseInt(hStr, 10);
  let m = parseInt(mStr, 10);
  if (isNaN(h)) h = 8;
  if (isNaN(m)) m = 0;

  const totalMins = h * 60 + m + minutes;
  const newH = Math.floor(totalMins / 60) % 24;
  const newM = totalMins % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

/**
 * Format start and end time into standard slot string "08:00 - 08:50"
 */
export function formatTimeSlot(startTime: string, endTime: string): string {
  const cleanStart = (startTime || '08:00').trim();
  const cleanEnd = (endTime || '08:50').trim();
  return `${cleanStart} - ${cleanEnd}`;
}

/**
 * Extract numerical minutes from a time slot for sorting chronologically
 */
export function getSlotStartMinutes(slot: string): number {
  const match = slot.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 9999;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

/**
 * Sort time slots chronologically by their start time
 */
export function sortTimeSlotsChronologically(slots: string[]): string[] {
  const unique = Array.from(new Set(slots));
  return unique.sort((a, b) => getSlotStartMinutes(a) - getSlotStartMinutes(b));
}

/**
 * Get visual styling badge color for a subject
 */
export function getSubjectBadgeColor(subjectName: string): string {
  const s = (subjectName || '').toLowerCase();
  if (s.includes('math') || s.includes('arithmetic') || s.includes('number')) {
    return 'bg-blue-50 text-blue-900 border-blue-200';
  }
  if (s.includes('science') || s.includes('physics') || s.includes('biology') || s.includes('chemistry')) {
    return 'bg-emerald-50 text-emerald-900 border-emerald-200';
  }
  if (s.includes('english') || s.includes('phonics') || s.includes('reading') || s.includes('spelling') || s.includes('literature')) {
    return 'bg-amber-50 text-amber-950 border-amber-200';
  }
  if (s.includes('social') || s.includes('world') || s.includes('people') || s.includes('history') || s.includes('geography')) {
    return 'bg-purple-50 text-purple-900 border-purple-200';
  }
  if (s.includes('ict') || s.includes('computing') || s.includes('computer')) {
    return 'bg-cyan-50 text-cyan-900 border-cyan-200';
  }
  if (s.includes('rme') || s.includes('religious') || s.includes('moral')) {
    return 'bg-indigo-50 text-indigo-900 border-indigo-200';
  }
  if (s.includes('art') || s.includes('creative') || s.includes('rhymes') || s.includes('music') || s.includes('drama')) {
    return 'bg-rose-50 text-rose-900 border-rose-200';
  }
  if (s.includes('french') || s.includes('ghanaian') || s.includes('twi') || s.includes('ga') || s.includes('fante')) {
    return 'bg-teal-50 text-teal-900 border-teal-200';
  }
  if (s.includes('pe') || s.includes('physical') || s.includes('sport') || s.includes('game')) {
    return 'bg-orange-50 text-orange-950 border-orange-200';
  }
  return 'bg-slate-50 text-slate-800 border-slate-200';
}
