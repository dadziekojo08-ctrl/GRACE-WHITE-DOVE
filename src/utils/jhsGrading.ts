/**
 * Official Grading Systems for Grace White Dove School Complex
 * 
 * 1. PRE-SCHOOL & LOWER PRIMARY GRADING SYSTEM (Nursery to Basic 3 / Class 3)
 * Reference: GRACE WHITE DOVE SCHOOL COMPLEX GRADING SYSTEM FOR PRE-SCHOOL & LOWER PRIMARY
 * Marks (%) | Position | Interpretation
 * 92 - 100  | 1ST      | DISTINCTION
 * 85 - 91   | 2ND      | EXCELLENT
 * 78 - 84   | 3RD      | VERY GOOD
 * 71 - 77   | 4TH      | GOOD
 * 64 - 70   | 5TH      | AVERAGE
 * 57 - 63   | 6TH      | FAIR
 * 50 - 56   | 7TH      | BARELY SATISFACTORY
 * 43 - 49   | 8TH      | PASS
 * 36 - 42   | 9TH      | WEAK PASS
 * 0 - 35    | 10TH     | FAIL
 * 
 * 2. JHS & UPPER PRIMARY GRADING SYSTEM (Basic 4 to JHS 3)
 * Raw Score | Grade | Grade Point | Interpretation
 * 80 - 100  | A     | 4.0         | Excellent
 * 75 - 79   | B+    | 3.5         | Very Good
 * 70 - 74   | B     | 3.0         | Good
 * 65 - 69   | C+    | 2.5         | Average
 * 60 - 64   | C     | 2.0         | Fair
 * 55 - 59   | D+    | 1.5         | barely satisfactory
 * 50 - 54   | D     | 1.0         | Weak Pass
 * Below 50  | E     | 0           | Fail
 */

export interface LowerPrimaryGradeTier {
  minScore: number;
  maxScore: number;
  scoreRangeLabel: string;
  position: string;
  grade: string;
  interpretation: string;
  badgeClass: string;
}

export const LOWER_PRIMARY_GRADING_SCHEME: LowerPrimaryGradeTier[] = [
  {
    minScore: 92,
    maxScore: 100,
    scoreRangeLabel: '92 – 100',
    position: '1ST',
    grade: '1ST',
    interpretation: 'DISTINCTION',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    minScore: 85,
    maxScore: 91.99,
    scoreRangeLabel: '85 – 91',
    position: '2ND',
    grade: '2ND',
    interpretation: 'EXCELLENT',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-300'
  },
  {
    minScore: 78,
    maxScore: 84.99,
    scoreRangeLabel: '78 – 84',
    position: '3RD',
    grade: '3RD',
    interpretation: 'VERY GOOD',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    minScore: 71,
    maxScore: 77.99,
    scoreRangeLabel: '71 – 77',
    position: '4TH',
    grade: '4TH',
    interpretation: 'GOOD',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-300'
  },
  {
    minScore: 64,
    maxScore: 70.99,
    scoreRangeLabel: '64 – 70',
    position: '5TH',
    grade: '5TH',
    interpretation: 'AVERAGE',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  },
  {
    minScore: 57,
    maxScore: 63.99,
    scoreRangeLabel: '57 – 63',
    position: '6TH',
    grade: '6TH',
    interpretation: 'FAIR',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  {
    minScore: 50,
    maxScore: 56.99,
    scoreRangeLabel: '50 – 56',
    position: '7TH',
    grade: '7TH',
    interpretation: 'BARELY SATISFACTORY',
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-300'
  },
  {
    minScore: 43,
    maxScore: 49.99,
    scoreRangeLabel: '43 – 49',
    position: '8TH',
    grade: '8TH',
    interpretation: 'PASS',
    badgeClass: 'bg-yellow-100 text-yellow-900 border-yellow-300'
  },
  {
    minScore: 36,
    maxScore: 42.99,
    scoreRangeLabel: '36 – 42',
    position: '9TH',
    grade: '9TH',
    interpretation: 'WEAK PASS',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  {
    minScore: 0,
    maxScore: 35.99,
    scoreRangeLabel: '0 – 35',
    position: '10TH',
    grade: '10TH',
    interpretation: 'FAIL',
    badgeClass: 'bg-red-100 text-red-800 border-red-300'
  }
];

export interface JHSGradeTier {
  minScore: number;
  maxScore: number;
  scoreRangeLabel: string;
  grade: string;
  gradePoint: number;
  interpretation: string;
  badgeClass: string;
}

export const JHS_GRADING_SCHEME: JHSGradeTier[] = [
  {
    minScore: 80,
    maxScore: 100,
    scoreRangeLabel: '80 – 100',
    grade: 'A',
    gradePoint: 4.0,
    interpretation: 'Excellent',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    minScore: 75,
    maxScore: 79.99,
    scoreRangeLabel: '75 – 79',
    grade: 'B+',
    gradePoint: 3.5,
    interpretation: 'Very Good',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-300'
  },
  {
    minScore: 70,
    maxScore: 74.99,
    scoreRangeLabel: '70 – 74',
    grade: 'B',
    gradePoint: 3.0,
    interpretation: 'Good',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    minScore: 65,
    maxScore: 69.99,
    scoreRangeLabel: '65 – 69',
    grade: 'C+',
    gradePoint: 2.5,
    interpretation: 'Average',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-300'
  },
  {
    minScore: 60,
    maxScore: 64.99,
    scoreRangeLabel: '60 – 64',
    grade: 'C',
    gradePoint: 2.0,
    interpretation: 'Fair',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  {
    minScore: 55,
    maxScore: 59.99,
    scoreRangeLabel: '55 – 59',
    grade: 'D+',
    gradePoint: 1.5,
    interpretation: 'barely satisfactory',
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-300'
  },
  {
    minScore: 50,
    maxScore: 54.99,
    scoreRangeLabel: '50 – 54',
    grade: 'D',
    gradePoint: 1.0,
    interpretation: 'Weak Pass',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  {
    minScore: 0,
    maxScore: 49.99,
    scoreRangeLabel: 'Below 50',
    grade: 'E',
    gradePoint: 0,
    interpretation: 'Fail',
    badgeClass: 'bg-red-100 text-red-800 border-red-300'
  }
];

export const OTHER_GRADES_INFO = [
  {
    grade: 'Audit',
    gradePoint: 0.0,
    description: 'The grade point is zero.'
  },
  {
    grade: 'Incomplete (IC)',
    gradePoint: 0.0,
    description: 'A student is graded IC when he/she misses one or more components of the assessment.'
  }
];

/**
 * Checks if a class belongs to Pre-School & Lower Primary (Nursery to Basic 3).
 */
export function isLowerPrimaryOrPreschool(className?: string): boolean {
  if (!className) return false;
  const lower = className.toLowerCase().trim();
  if (lower.includes('creche') || lower.includes('crèche')) return true;
  if (lower.includes('nursery')) return true;
  if (lower.includes('kg') || lower.includes('kindergarten')) return true;
  if (lower.includes('primary 1') || lower.includes('basic 1') || lower.includes('class 1') || lower.includes('grade 1')) return true;
  if (lower.includes('primary 2') || lower.includes('basic 2') || lower.includes('class 2') || lower.includes('grade 2')) return true;
  if (lower.includes('primary 3') || lower.includes('basic 3') || lower.includes('class 3') || lower.includes('grade 3')) return true;
  return false;
}

export interface GenericGradeResult {
  grade: string;
  position?: string;
  gradePoint: number;
  interpretation: string;
  scoreRangeLabel: string;
  badgeClass: string;
  isSpecial?: boolean;
  schemeType: 'lower_primary' | 'jhs_upper';
}

/**
 * Calculates Pre-School & Lower Primary Grade & Interpretation (Nursery - Basic 3)
 */
export function calculateLowerPrimaryGrade(
  rawScore: number | null | undefined,
  specialStatus?: 'IC' | 'Audit' | 'Incomplete (IC)' | 'None'
): GenericGradeResult {
  if (specialStatus === 'IC' || specialStatus === 'Incomplete (IC)') {
    return {
      grade: 'IC',
      position: 'IC',
      gradePoint: 0.0,
      interpretation: 'INCOMPLETE',
      scoreRangeLabel: 'Incomplete',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
      isSpecial: true,
      schemeType: 'lower_primary'
    };
  }

  if (specialStatus === 'Audit') {
    return {
      grade: 'Audit',
      position: 'Audit',
      gradePoint: 0.0,
      interpretation: 'AUDIT',
      scoreRangeLabel: 'Audit',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
      isSpecial: true,
      schemeType: 'lower_primary'
    };
  }

  const score = Math.max(0, Math.min(100, Math.round((rawScore ?? 0) * 10) / 10));

  for (const tier of LOWER_PRIMARY_GRADING_SCHEME) {
    if (score >= tier.minScore && (tier.maxScore >= 100 ? score <= 100 : score <= tier.maxScore + 0.001)) {
      return {
        grade: tier.grade,
        position: tier.position,
        gradePoint: tier.position === '1ST' ? 4.0 : tier.position === '2ND' ? 3.8 : tier.position === '3RD' ? 3.5 : tier.position === '4TH' ? 3.0 : tier.position === '5TH' ? 2.5 : tier.position === '6TH' ? 2.0 : tier.position === '7TH' ? 1.5 : tier.position === '8TH' ? 1.0 : tier.position === '9TH' ? 0.5 : 0,
        interpretation: tier.interpretation,
        scoreRangeLabel: tier.scoreRangeLabel,
        badgeClass: tier.badgeClass,
        isSpecial: false,
        schemeType: 'lower_primary'
      };
    }
  }

  return {
    grade: '10TH',
    position: '10TH',
    gradePoint: 0,
    interpretation: 'FAIL',
    scoreRangeLabel: '0 – 35',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    isSpecial: false,
    schemeType: 'lower_primary'
  };
}

/**
 * Calculates the JHS Grade, Grade Point, and Interpretation from raw total score.
 */
export function calculateJHSGrade(
  rawScore: number | null | undefined,
  specialStatus?: 'IC' | 'Audit' | 'Incomplete (IC)' | 'None'
): GenericGradeResult {
  if (specialStatus === 'IC' || specialStatus === 'Incomplete (IC)') {
    return {
      grade: 'IC',
      position: 'IC',
      gradePoint: 0.0,
      interpretation: 'Incomplete Assessment',
      scoreRangeLabel: 'Incomplete',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
      isSpecial: true,
      schemeType: 'jhs_upper'
    };
  }

  if (specialStatus === 'Audit') {
    return {
      grade: 'Audit',
      position: 'Audit',
      gradePoint: 0.0,
      interpretation: 'Audit Course',
      scoreRangeLabel: 'Audit',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
      isSpecial: true,
      schemeType: 'jhs_upper'
    };
  }

  const score = Math.max(0, Math.min(100, Math.round((rawScore ?? 0) * 10) / 10));

  for (const tier of JHS_GRADING_SCHEME) {
    if (score >= tier.minScore && (tier.maxScore >= 100 ? score <= 100 : score <= tier.maxScore + 0.001)) {
      return {
        grade: tier.grade,
        position: tier.grade,
        gradePoint: tier.gradePoint,
        interpretation: tier.interpretation,
        scoreRangeLabel: tier.scoreRangeLabel,
        badgeClass: tier.badgeClass,
        isSpecial: false,
        schemeType: 'jhs_upper'
      };
    }
  }

  // Fallback for below 50
  return {
    grade: 'E',
    position: 'E',
    gradePoint: 0,
    interpretation: 'Fail',
    scoreRangeLabel: 'Below 50',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    isSpecial: false,
    schemeType: 'jhs_upper'
  };
}

/**
 * Universal Grade Calculator that automatically switches based on class level
 */
export function calculateGradeForClass(
  rawScore: number | null | undefined,
  className?: string,
  specialStatus?: 'IC' | 'Audit' | 'Incomplete (IC)' | 'None'
): GenericGradeResult {
  if (isLowerPrimaryOrPreschool(className)) {
    return calculateLowerPrimaryGrade(rawScore, specialStatus);
  }
  return calculateJHSGrade(rawScore, specialStatus);
}

/**
 * Calculates the Grade Point Average (GPA out of 4.0) for an array of marks or grade points.
 */
export function calculateJHSGPA(
  entries: Array<{ gradePoint?: number; score?: number; totalScore?: number; specialStatus?: string }>,
  className?: string
): { gpa: number; formattedGpa: string; totalPoints: number; validCount: number; classification: string } {
  if (!entries || entries.length === 0) {
    return { gpa: 0, formattedGpa: '0.00', totalPoints: 0, validCount: 0, classification: 'N/A' };
  }

  let totalPoints = 0;
  let validCount = 0;

  for (const entry of entries) {
    let gp = entry.gradePoint;
    if (gp === undefined) {
      const res = calculateGradeForClass(entry.totalScore ?? entry.score, className, entry.specialStatus as any);
      gp = res.gradePoint;
    }
    totalPoints += gp;
    validCount += 1;
  }

  const gpa = validCount > 0 ? Math.round((totalPoints / validCount) * 100) / 100 : 0;
  const formattedGpa = gpa.toFixed(2);

  let classification = 'Fail';
  if (isLowerPrimaryOrPreschool(className)) {
    if (gpa >= 3.8) classification = 'Distinction (1st Rank)';
    else if (gpa >= 3.5) classification = 'Excellent (2nd Rank)';
    else if (gpa >= 3.0) classification = 'Very Good (3rd Rank)';
    else if (gpa >= 2.5) classification = 'Good (4th Rank)';
    else if (gpa >= 2.0) classification = 'Average (5th Rank)';
    else if (gpa >= 1.5) classification = 'Fair (6th Rank)';
    else if (gpa >= 1.0) classification = 'Barely Satisfactory (7th Rank)';
    else classification = 'Pass / Needs Support';
  } else {
    if (gpa >= 3.8) classification = 'First Class Distinction / Excellent';
    else if (gpa >= 3.5) classification = 'Very Good';
    else if (gpa >= 3.0) classification = 'Good';
    else if (gpa >= 2.5) classification = 'Average';
    else if (gpa >= 2.0) classification = 'Fair';
    else if (gpa >= 1.5) classification = 'Barely Satisfactory';
    else if (gpa >= 1.0) classification = 'Weak Pass';
  }

  return {
    gpa,
    formattedGpa,
    totalPoints: Math.round(totalPoints * 10) / 10,
    validCount,
    classification
  };
}

