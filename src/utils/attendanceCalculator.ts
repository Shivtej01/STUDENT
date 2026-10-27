/**
 * SmartAttend AI - Deterministic Attendance Calculation Engine
 * 
 * Implements strict mathematical logic for attendance percentage,
 * target class requirements, bunk calculators, and threshold compliance.
 */

export interface SubjectAttendanceSummary {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  held: number;
  attended: number;
  absent: number;
  late: number;
  percentage: number;
  isLow: number; // percentage below threshold
  status: 'safe' | 'warning' | 'critical';
}

export interface TargetRequirementResult {
  classesNeeded: number;
  achievable: boolean;
  targetPercentage: number;
  currentPercentage: number;
  classesHeld: number;
  classesAttended: number;
  projectedTotalClasses: number;
  message: string;
}

export interface BunkAllowanceResult {
  classesCanMiss: number;
  thresholdPercentage: number;
  currentPercentage: number;
  message: string;
}

/**
 * Calculates standard attendance percentage: (Classes Attended / Total Classes Held) * 100
 * Handles zero held classes gracefully (defaults to 100%).
 * Rounds to 1 decimal place.
 */
export function calculateAttendancePercentage(attended: number, held: number): number {
  if (held <= 0) return 100;
  if (attended <= 0) return 0;
  const pct = (attended / held) * 100;
  return Math.min(100, Math.max(0, Math.round(pct * 10) / 10));
}

/**
 * Calculates minimum future consecutive classes that must be attended
 * to reach target attendance fraction T (0 < T < 1).
 * Formula: n = max(0, ceiling((T * H - A) / (1 - T)))
 * 
 * @param attended Current attended classes (A)
 * @param held Total classes held (H)
 * @param targetPct Target attendance percentage (e.g., 75, 80)
 */
export function calculateFutureClassesNeeded(
  attended: number,
  held: number,
  targetPct: number = 75
): TargetRequirementResult {
  const currentPct = calculateAttendancePercentage(attended, held);
  
  if (held <= 0) {
    return {
      classesNeeded: 0,
      achievable: true,
      targetPercentage: targetPct,
      currentPercentage: 100,
      classesHeld: held,
      classesAttended: attended,
      projectedTotalClasses: held,
      message: 'No classes have been conducted yet. Attendance is currently at 100%.',
    };
  }

  if (targetPct >= 100) {
    const missed = held - attended;
    if (missed > 0) {
      return {
        classesNeeded: 0,
        achievable: false,
        targetPercentage: targetPct,
        currentPercentage: currentPct,
        classesHeld: held,
        classesAttended: attended,
        projectedTotalClasses: held,
        message: '100% attendance is mathematically impossible because classes have already been missed.',
      };
    } else {
      return {
        classesNeeded: 0,
        achievable: true,
        targetPercentage: targetPct,
        currentPercentage: 100,
        classesHeld: held,
        classesAttended: attended,
        projectedTotalClasses: held,
        message: 'You already have 100% attendance.',
      };
    }
  }

  if (currentPct >= targetPct) {
    return {
      classesNeeded: 0,
      achievable: true,
      targetPercentage: targetPct,
      currentPercentage: currentPct,
      classesHeld: held,
      classesAttended: attended,
      projectedTotalClasses: held,
      message: `You are already meeting or exceeding your target of ${targetPct}%.`,
    };
  }

  const T = targetPct / 100;
  // Formula: n = ceil((T * H - A) / (1 - T))
  // Use epsilon to prevent floating-point inaccuracy (e.g. 1 / 0.2 becoming 5.000000000000001)
  const numerator = T * held - attended;
  const denominator = 1 - T;
  const rawRatio = numerator / denominator;
  const roundedRatio = Math.round(rawRatio * 100000000) / 100000000;
  const n = Math.max(0, Math.ceil(roundedRatio));

  const projectedTotal = held + n;
  const projectedAttended = attended + n;
  const projectedPct = calculateAttendancePercentage(projectedAttended, projectedTotal);

  return {
    classesNeeded: n,
    achievable: true,
    targetPercentage: targetPct,
    currentPercentage: currentPct,
    classesHeld: held,
    classesAttended: attended,
    projectedTotalClasses: projectedTotal,
    message: `You must attend the next ${n} consecutive ${n === 1 ? 'class' : 'classes'} without missing any to reach ${targetPct}% (projected: ${projectedPct}%).`,
  };
}

/**
 * Calculates how many consecutive upcoming classes a student can miss (bunk)
 * while still staying at or above the minimum required threshold T.
 * Formula: m = floor((A - T * H) / T)
 */
export function calculateBunkAllowance(
  attended: number,
  held: number,
  thresholdPct: number = 75
): BunkAllowanceResult {
  const currentPct = calculateAttendancePercentage(attended, held);
  
  if (held <= 0 || currentPct < thresholdPct) {
    return {
      classesCanMiss: 0,
      thresholdPercentage: thresholdPct,
      currentPercentage: currentPct,
      message: `Attendance is already below or at ${thresholdPct}%. You cannot miss any upcoming classes.`,
    };
  }

  const T = thresholdPct / 100;
  // (A / (H + m)) >= T => A >= T * H + T * m => T * m <= A - T * H => m = floor((A - T * H) / T)
  const numerator = attended - T * held;
  const rawRatio = numerator / T;
  const roundedRatio = Math.round(rawRatio * 100000000) / 100000000;
  const m = Math.max(0, Math.floor(roundedRatio));

  return {
    classesCanMiss: m,
    thresholdPercentage: thresholdPct,
    currentPercentage: currentPct,
    message: m > 0 
      ? `You can safely miss up to ${m} upcoming ${m === 1 ? 'class' : 'classes'} and still maintain at least ${thresholdPct}%.`
      : `You are right on the edge of ${thresholdPct}%. Missing even 1 class will drop your attendance below the threshold.`,
  };
}

/**
 * Determines status level based on percentage and institutional threshold
 */
export function getAttendanceStatus(percentage: number, threshold: number = 75): 'safe' | 'warning' | 'critical' {
  if (percentage >= threshold) return 'safe';
  if (percentage >= threshold - 10) return 'warning';
  return 'critical';
}
