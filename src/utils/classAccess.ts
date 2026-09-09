import { ClassRoom, Student, TimetableEntry } from '../types';
import { normalizeClassKey } from './teacherAssignment';

export { normalizeClassKey };

export interface TeacherAccessContext {
  id?: string;
  name?: string | null;
  role?: string | null;
  assignedClass?: string | null;
  designation?: string | null;
  department?: string | null;
}

/**
 * Checks if a class name or grade level belongs to the Junior High School (JHS) department.
 * Recognizes variations: "JHS 1", "JHS 2", "JHS 3", "Basic 7", "Basic 8", "Basic 9", "Grade 7", "Grade 8", "Grade 9", "Junior High"
 */
export const isJHSClass = (className?: string | null): boolean => {
  if (!className) return false;
  const lower = className.toLowerCase().trim();
  return (
    lower.includes('jhs') ||
    lower.includes('junior high') ||
    lower.includes('basic 7') ||
    lower.includes('basic 8') ||
    lower.includes('basic 9') ||
    lower.includes('grade 7') ||
    lower.includes('grade 8') ||
    lower.includes('grade 9')
  );
};

/**
 * Checks if a teacher is a Junior High School (JHS) faculty member.
 * A teacher is classified as JHS if:
 * 1. Their assigned class is a JHS class (e.g. JHS 1, JHS 2, JHS 3)
 * 2. OR their designation/role mentions JHS (e.g. "JHS Science Teacher", "JHS Mathematics Teacher")
 * 3. OR their department is "Junior High School" / "JHS"
 */
export const isJHSTeacher = (teacher?: TeacherAccessContext | null): boolean => {
  if (!teacher) return false;
  if (isJHSClass(teacher.assignedClass)) return true;

  const des = (teacher.designation || '').toLowerCase();
  const dep = (teacher.department || '').toLowerCase();
  const name = (teacher.name || '').toLowerCase();

  return (
    des.includes('jhs') ||
    des.includes('junior high') ||
    dep.includes('jhs') ||
    dep.includes('junior high') ||
    name.includes('jhs')
  );
};

/**
 * Computes the authorized classes a teacher or staff member is permitted to access.
 *
 * Rules:
 * 1. Admins / Headmasters:
 *    - Full access to ALL classes across Pre-School, Primary, and JHS.
 * 2. JHS Teachers:
 *    - Allowed to switch between and access ALL JHS classes: JHS 1, JHS 2, and JHS 3.
 *    - Strictly CANNOT access Primary (Class 1 to 6) or Early Childhood (Creche, Nursery, KG).
 * 3. Primary & Pre-School Teachers (e.g. Class 1, Class 2, Creche, Nursery, KG):
 *    - ONLY have access to their ONE assigned classroom.
 *    - Example: Class 1 teacher can ONLY access Class 1.
 *      They CANNOT access Class 2, Class 3, Creche, Nursery, or JHS!
 */
export const getAllowedClassesForTeacher = (
  teacher: TeacherAccessContext | null | undefined,
  allClasses: ClassRoom[],
  isAdminOverride: boolean = false
): ClassRoom[] => {
  if (!allClasses || allClasses.length === 0) {
    return [];
  }

  // 1. Admin Override (Full school oversight)
  if (isAdminOverride || teacher?.role === 'Admin') {
    return allClasses;
  }

  // 2. JHS Teachers: Can switch between JHS 1, JHS 2, and JHS 3
  if (isJHSTeacher(teacher)) {
    const jhsClasses = allClasses.filter(
      (c) => isJHSClass(c.name) || isJHSClass(c.level)
    );
    if (jhsClasses.length > 0) {
      return jhsClasses;
    }
    // Fallback if class names in database are unlabelled
    return allClasses.filter((c) => c.name.toLowerCase().includes('jhs'));
  }

  // 3. Class Teachers (Class 1, Class 2, Creche, Nursery, KG, etc.)
  // Strictly restricted to their ONE designated classroom!
  const assigned = teacher?.assignedClass?.trim();
  if (assigned) {
    const assignedKey = normalizeClassKey(assigned);
    const matched = allClasses.filter((c) => {
      if (c.name.toLowerCase() === assigned.toLowerCase()) return true;
      if (c.level && c.level.toLowerCase() === assigned.toLowerCase()) return true;
      if (assignedKey && normalizeClassKey(c.name) === assignedKey) return true;
      return false;
    });

    if (matched.length > 0) {
      return matched;
    }

    // If teacher has assigned class string but class object is not in array yet, generate a safe single class representation
    return [
      {
        id: `cls-${assignedKey || 'assigned'}`,
        name: assigned,
        level: assigned,
        stream: 'A',
        classTeacher: teacher?.name || 'Class Teacher',
        roomNumber: 'Classroom',
        capacity: 35,
        enrolledCount: 0,
        classPrefect: '',
        subjects: [],
        averageAttendanceRate: 0,
        termAverageScore: 0
      }
    ];
  }

  // 4. Check if any class has this teacher listed as classTeacher
  if (teacher?.name) {
    const tNameLower = teacher.name.toLowerCase();
    const matchedByClassTeacher = allClasses.filter(
      (c) => c.classTeacher && c.classTeacher.toLowerCase() === tNameLower
    );

    if (matchedByClassTeacher.length > 0) {
      // If one of the matched classes is JHS, grant full JHS scope
      if (matchedByClassTeacher.some((c) => isJHSClass(c.name))) {
        return allClasses.filter((c) => isJHSClass(c.name) || isJHSClass(c.level));
      }
      // Otherwise strictly lock to the primary/preschool assigned class
      return [matchedByClassTeacher[0]];
    }
  }

  // Fallback: If teacher has no class assigned, lock strictly to the first class or empty
  return allClasses.slice(0, 1);
};

/**
 * Validates whether a teacher is authorized to access or switch to a target class.
 *
 * Example:
 * - canTeacherAccessClass(class1Teacher, 'Primary 1 (Grade 1)') => true
 * - canTeacherAccessClass(class1Teacher, 'Primary 2 (Grade 2)') => false
 * - canTeacherAccessClass(class1Teacher, 'Creche') => false
 * - canTeacherAccessClass(jhsTeacher, 'JHS 1 (Grade 7)') => true
 * - canTeacherAccessClass(jhsTeacher, 'JHS 2 (Grade 8)') => true
 * - canTeacherAccessClass(jhsTeacher, 'JHS 3 (Grade 9)') => true
 * - canTeacherAccessClass(jhsTeacher, 'Primary 1 (Grade 1)') => false
 */
export const canTeacherAccessClass = (
  teacher: TeacherAccessContext | null | undefined,
  targetClassName: string,
  allClasses: ClassRoom[],
  isAdminOverride: boolean = false
): boolean => {
  if (isAdminOverride || teacher?.role === 'Admin') {
    return true;
  }
  if (!targetClassName) return false;

  const allowed = getAllowedClassesForTeacher(teacher, allClasses, isAdminOverride);
  const targetKey = normalizeClassKey(targetClassName);

  return allowed.some(
    (c) =>
      c.name.toLowerCase() === targetClassName.toLowerCase() ||
      (targetKey && normalizeClassKey(c.name) === targetKey) ||
      (c.level && normalizeClassKey(c.level) === targetKey)
  );
};

/**
 * Filters the student list according to the teacher's authorized class scope.
 */
export const filterStudentsForTeacherScope = (
  allStudents: Student[],
  teacher: TeacherAccessContext | null | undefined,
  activeSelectedClass: string,
  allClasses: ClassRoom[],
  isAdminOverride: boolean = false
): Student[] => {
  if (isAdminOverride || teacher?.role === 'Admin') {
    if (!activeSelectedClass || activeSelectedClass === 'All') {
      return allStudents;
    }
    return allStudents.filter(
      (s) =>
        s.className?.toLowerCase() === activeSelectedClass.toLowerCase() ||
        normalizeClassKey(s.className) === normalizeClassKey(activeSelectedClass)
    );
  }

  const allowedClasses = getAllowedClassesForTeacher(teacher, allClasses, false);
  const allowedNames = allowedClasses.map((c) => c.name.toLowerCase());
  const allowedKeys = allowedClasses.map((c) => normalizeClassKey(c.name));

  // Verify that activeSelectedClass is within allowed scope
  const targetClass = canTeacherAccessClass(teacher, activeSelectedClass, allClasses, false)
    ? activeSelectedClass
    : allowedClasses[0]?.name;

  if (!targetClass) {
    return [];
  }

  const targetKey = normalizeClassKey(targetClass);

  return allStudents.filter((s) => {
    const sClassLower = (s.className || '').toLowerCase();
    const sKey = normalizeClassKey(s.className);

    // Must match the currently selected active allowed class
    const matchesTarget =
      sClassLower === targetClass.toLowerCase() ||
      (targetKey && sKey === targetKey) ||
      sClassLower.includes(targetClass.toLowerCase()) ||
      targetClass.toLowerCase().includes(sClassLower);

    // And must be within the teacher's allowed scope
    const inAllowedScope =
      allowedNames.includes(sClassLower) ||
      (sKey && allowedKeys.includes(sKey));

    return matchesTarget && inAllowedScope;
  });
};

/**
 * Filters timetable entries according to teacher's authorized class scope.
 */
export const filterTimetableForTeacherScope = (
  allTimetable: TimetableEntry[],
  teacher: TeacherAccessContext | null | undefined,
  activeSelectedClass: string,
  allClasses: ClassRoom[],
  isAdminOverride: boolean = false
): TimetableEntry[] => {
  if (isAdminOverride || teacher?.role === 'Admin') {
    if (!activeSelectedClass || activeSelectedClass === 'All') {
      return allTimetable;
    }
    return allTimetable.filter((t) => t.className === activeSelectedClass);
  }

  const allowedClasses = getAllowedClassesForTeacher(teacher, allClasses, false);
  const targetClass = canTeacherAccessClass(teacher, activeSelectedClass, allClasses, false)
    ? activeSelectedClass
    : allowedClasses[0]?.name;

  if (!targetClass) return [];

  const targetKey = normalizeClassKey(targetClass);

  return allTimetable.filter((t) => {
    const tClassLower = (t.className || '').toLowerCase();
    const tKey = normalizeClassKey(t.className);

    return (
      tClassLower === targetClass.toLowerCase() ||
      (targetKey && tKey === targetKey)
    );
  });
};
