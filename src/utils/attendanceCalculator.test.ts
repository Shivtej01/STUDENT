import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAttendancePercentage,
  calculateFutureClassesNeeded,
  calculateBunkAllowance,
  getAttendanceStatus,
} from './attendanceCalculator';

test('calculateAttendancePercentage handles basic ratios correctly', () => {
  assert.equal(calculateAttendancePercentage(15, 20), 75);
  assert.equal(calculateAttendancePercentage(18, 20), 90);
  assert.equal(calculateAttendancePercentage(0, 10), 0);
  assert.equal(calculateAttendancePercentage(10, 10), 100);
});

test('calculateAttendancePercentage handles zero held classes without divide-by-zero', () => {
  assert.equal(calculateAttendancePercentage(0, 0), 100);
});

test('calculateFutureClassesNeeded formula matches specification: n = ceiling((T*H - A)/(1-T))', () => {
  // Example: Held = 20, Attended = 12 (60%). Target = 75% (T=0.75).
  // Formula: (0.75 * 20 - 12) / (1 - 0.75) = (15 - 12) / 0.25 = 3 / 0.25 = 12.
  // After attending 12 more: Attended = 24, Held = 32. 24 / 32 = 75.0%.
  const res = calculateFutureClassesNeeded(12, 20, 75);
  assert.equal(res.classesNeeded, 12);
  assert.equal(res.achievable, true);
  assert.equal(res.currentPercentage, 60);

  // Check another case: Held = 10, Attended = 7 (70%). Target = 80% (T=0.8).
  // (0.8 * 10 - 7) / (1 - 0.8) = (8 - 7) / 0.2 = 1 / 0.2 = 5.
  // After 5: Attended = 12, Held = 15. 12 / 15 = 80%.
  const res2 = calculateFutureClassesNeeded(7, 10, 80);
  assert.equal(res2.classesNeeded, 5);
});

test('calculateFutureClassesNeeded returns 0 when target is already met', () => {
  const res = calculateFutureClassesNeeded(18, 20, 75);
  assert.equal(res.classesNeeded, 0);
  assert.equal(res.achievable, true);
});

test('calculateFutureClassesNeeded handles impossible 100% target when classes missed', () => {
  const res = calculateFutureClassesNeeded(9, 10, 100);
  assert.equal(res.achievable, false);
});

test('calculateBunkAllowance computes safe misses accurately', () => {
  // Held = 20, Attended = 18 (90%). Threshold = 75% (T=0.75).
  // m = floor((18 - 0.75 * 20) / 0.75) = floor((18 - 15) / 0.75) = floor(3 / 0.75) = 4.
  // If misses 4: Attended = 18, Held = 24. 18 / 24 = 75.0%.
  const bunk = calculateBunkAllowance(18, 20, 75);
  assert.equal(bunk.classesCanMiss, 4);

  // If already at or below 75%:
  const bunkZero = calculateBunkAllowance(15, 20, 75);
  assert.equal(bunkZero.classesCanMiss, 0);
});

test('getAttendanceStatus flags safe, warning and critical appropriately', () => {
  assert.equal(getAttendanceStatus(85, 75), 'safe');
  assert.equal(getAttendanceStatus(75, 75), 'safe');
  assert.equal(getAttendanceStatus(68, 75), 'warning');
  assert.equal(getAttendanceStatus(55, 75), 'critical');
});
