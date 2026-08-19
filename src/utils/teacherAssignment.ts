import { ClassRoom, StaffMember, AuthUser } from '../types';

/**
 * Normalizes class names into a standardized key for robust comparison
 * Handles variations like "Primary 1 (Grade 1)", "Class 1", "Basic 1", "Grade 1", "P1", "Class One", etc.
 */
export const normalizeClassKey = (rawName?: string | null): string => {
  if (!rawName) return '';
  const text = rawName.toLowerCase().trim();

  // Creche / Daycare
  if (text.includes('creche') || text.includes('crèche') || text.includes('daycare')) {
    return 'creche';
  }

  // Nursery 1 & 2
  if (text.includes('nursery 1') || text.includes('nur 1') || text.includes('nur1') || text.includes('nursery one')) {
    return 'nursery_1';
  }
  if (text.includes('nursery 2') || text.includes('nur 2') || text.includes('nur2') || text.includes('nursery two')) {
    return 'nursery_2';
  }
  if (text.includes('nursery')) {
    return 'nursery_1';
  }

  // Kindergarten (KG) 1 & 2
  if (text.includes('kg 1') || text.includes('kg1') || text.includes('kindergarten 1') || text.includes('kindergarten one')) {
    return 'kg_1';
  }
  if (text.includes('kg 2') || text.includes('kg2') || text.includes('kindergarten 2') || text.includes('kindergarten two')) {
    return 'kg_2';
  }
  if (text.includes('kindergarten') || text.includes('kg')) {
    return 'kg_1';
  }

  // Primary 1 to 6 / Class 1 to 6 / Grade 1 to 6 / Basic 1 to 6
  if (
    text.includes('primary 1') || text.includes('class 1') || text.includes('grade 1') || 
    text.includes('basic 1') || text.includes('p1') || text.includes('p 1') || 
    text.includes('class one') || text.includes('primary one')
  ) {
    return 'primary_1';
  }

  if (
    text.includes('primary 2') || text.includes('class 2') || text.includes('grade 2') || 
    text.includes('basic 2') || text.includes('p2') || text.includes('p 2') || 
    text.includes('class two') || text.includes('primary two')
  ) {
    return 'primary_2';
  }

  if (
    text.includes('primary 3') || text.includes('class 3') || text.includes('grade 3') || 
    text.includes('basic 3') || text.includes('p3') || text.includes('p 3') || 
    text.includes('class three') || text.includes('primary three')
  ) {
    return 'primary_3';
  }

  if (
    text.includes('primary 4') || text.includes('class 4') || text.includes('grade 4') || 
    text.includes('basic 4') || text.includes('p4') || text.includes('p 4') || 
    text.includes('class four') || text.includes('primary four')
  ) {
    return 'primary_4';
  }

  if (
    text.includes('primary 5') || text.includes('class 5') || text.includes('grade 5') || 
    text.includes('basic 5') || text.includes('p5') || text.includes('p 5') || 
    text.includes('class five') || text.includes('primary five')
  ) {
    return 'primary_5';
  }

  if (
    text.includes('primary 6') || text.includes('class 6') || text.includes('grade 6') || 
    text.includes('basic 6') || text.includes('p6') || text.includes('p 6') || 
    text.includes('class six') || text.includes('primary six')
  ) {
    return 'primary_6';
  }

  // JHS / Basic 7, 8, 9 / Grade 7, 8, 9
  if (
    text.includes('jhs 1') || text.includes('jhs1') || text.includes('basic 7') || 
    text.includes('grade 7') || text.includes('junior high 1') || text.includes('j.h.s 1')
  ) {
    return 'jhs_1';
  }

  if (
    text.includes('jhs 2') || text.includes('jhs2') || text.includes('basic 8') || 
    text.includes('grade 8') || text.includes('junior high 2') || text.includes('j.h.s 2')
  ) {
    return 'jhs_2';
  }

  if (
    text.includes('jhs 3') || text.includes('jhs3') || text.includes('basic 9') || 
    text.includes('grade 9') || text.includes('junior high 3') || text.includes('j.h.s 3')
  ) {
    return 'jhs_3';
  }

  // Fallback: strip punctuation and whitespace
  return text.replace(/[^a-z0-9]/g, '');
};

export interface MatchedTeacherResult {
  teacherName: string;
  source: 'class_roster' | 'staff_registry' | 'teacher_account';
  matchedClass: string;
  teacherEmail?: string;
  teacherPhone?: string;
  photoUrl?: string;
  qualification?: string;
}

/**
 * Automatically suggests and finds the designated classroom teacher for any specified class level.
 */
export const findTeacherForClass = (
  targetClassName: string,
  sources: {
    classes?: ClassRoom[];
    staff?: StaffMember[];
    authUsers?: AuthUser[];
  }
): MatchedTeacherResult | null => {
  if (!targetClassName || targetClassName.trim() === '') return null;
  const targetKey = normalizeClassKey(targetClassName);

  const { classes = [], staff = [], authUsers = [] } = sources;

  // 1. Check Registered Classrooms (classes collection)
  const directClass = classes.find((c) => {
    if (!c.classTeacher || c.classTeacher.trim() === '' || c.classTeacher.toLowerCase() === 'unassigned') {
      return false;
    }
    return normalizeClassKey(c.name) === targetKey || normalizeClassKey(c.level) === targetKey;
  });

  if (directClass && directClass.classTeacher) {
    // Look up additional details from staff if available
    const staffMatch = staff.find((s) => s.name.toLowerCase() === directClass.classTeacher.toLowerCase());
    return {
      teacherName: directClass.classTeacher,
      source: 'class_roster',
      matchedClass: directClass.name,
      teacherEmail: staffMatch?.email,
      teacherPhone: staffMatch?.phone,
      photoUrl: staffMatch?.photoUrl || staffMatch?.avatarUrl,
      qualification: staffMatch?.qualification
    };
  }

  // 2. Check Staff Registry (staff collection where role === 'Teacher' and assignedClass is set)
  const matchedStaff = staff.find((s) => {
    if (s.role !== 'Teacher') return false;
    if (s.assignedClass && normalizeClassKey(s.assignedClass) === targetKey) return true;
    if (s.department && normalizeClassKey(s.department) === targetKey) return true;
    if (s.designation && normalizeClassKey(s.designation) === targetKey) return true;
    return false;
  });

  if (matchedStaff) {
    return {
      teacherName: matchedStaff.name,
      source: 'staff_registry',
      matchedClass: matchedStaff.assignedClass || targetClassName,
      teacherEmail: matchedStaff.email,
      teacherPhone: matchedStaff.phone,
      photoUrl: matchedStaff.photoUrl || matchedStaff.avatarUrl,
      qualification: matchedStaff.qualification
    };
  }

  // 3. Check Active Auth Users (authUsers collection where role === 'Teacher')
  const matchedAuthUser = authUsers.find((u) => {
    if (u.role !== 'Teacher') return false;
    if (u.assignedClass && normalizeClassKey(u.assignedClass) === targetKey) return true;
    return false;
  });

  if (matchedAuthUser) {
    return {
      teacherName: matchedAuthUser.name,
      source: 'teacher_account',
      matchedClass: matchedAuthUser.assignedClass || targetClassName,
      teacherEmail: matchedAuthUser.email,
      teacherPhone: matchedAuthUser.phone,
      photoUrl: matchedAuthUser.photoUrl || matchedAuthUser.avatarUrl
    };
  }

  // 4. Fuzzy fallback in classes
  const fuzzyClass = classes.find((c) => {
    if (!c.classTeacher || c.classTeacher.trim() === '') return false;
    const cNameKey = normalizeClassKey(c.name);
    return cNameKey.includes(targetKey) || targetKey.includes(cNameKey);
  });

  if (fuzzyClass && fuzzyClass.classTeacher) {
    return {
      teacherName: fuzzyClass.classTeacher,
      source: 'class_roster',
      matchedClass: fuzzyClass.name
    };
  }

  return null;
};
