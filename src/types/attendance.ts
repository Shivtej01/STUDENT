/**
 * SmartAttend AI - Data Models matching AWS DynamoDB entities
 * and application domain structures.
 */

export type UserRole = 'student' | 'teacher' | 'admin';

export type AttendanceStatus = 'present' | 'absent' | 'late';

export type SessionStatus = 'active' | 'completed' | 'cancelled';

export interface User {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  departmentName?: string;
  semester: number;
  accountStatus: 'active' | 'inactive';
  avatar?: string;
  rollNumber?: string; // e.g. CS2023-042
  employeeId?: string; // e.g. FAC-CSE-109
  phone?: string;
}

export interface Department {
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  hodName: string;
  totalStudents: number;
  totalTeachers: number;
}

export interface Subject {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  departmentId: string;
  semester: number;
  teacherId: string;
  teacherName?: string;
  credits: number;
  threshold: number; // default 75%
  room?: string;
}

export interface Enrollment {
  enrollmentId: string;
  studentId: string;
  studentName?: string;
  rollNumber?: string;
  subjectId: string;
  subjectCode?: string;
  academicYear: string;
  enrollmentStatus: 'enrolled' | 'dropped';
}

export interface AttendanceSession {
  sessionId: string;
  subjectId: string;
  subjectCode?: string;
  subjectName?: string;
  teacherId: string;
  teacherName?: string;
  sessionDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  sessionStatus: SessionStatus;
  sessionType: 'manual' | 'qr';
  qrToken?: string;
  qrExpiresAt?: number; // timestamp ms
  room: string;
  totalStudentsEnrolled: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
}

export interface AttendanceRecord {
  recordId: string; // Composite key: ${sessionId}#${studentId}
  sessionId: string;
  studentId: string;
  studentName?: string;
  rollNumber?: string;
  subjectId: string;
  subjectCode?: string;
  subjectName?: string;
  sessionDate: string;
  sessionTime?: string;
  attendanceStatus: AttendanceStatus;
  markedAt: string; // ISO string
  markedBy: 'teacher' | 'student_qr' | 'admin_audit';
  updatedAt?: string;
  notes?: string;
}

export interface AuditLog {
  auditId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: 'CREATE_SESSION' | 'MARK_ATTENDANCE' | 'UPDATE_ATTENDANCE' | 'ENROLL_STUDENT' | 'UPDATE_THRESHOLD' | 'SYSTEM_CONFIG';
  entityType: 'SESSION' | 'ATTENDANCE_RECORD' | 'USER' | 'SUBJECT' | 'SETTING';
  entityId: string;
  timestamp: string;
  reason: string;
  previousValue?: string;
  newValue?: string;
}

export interface TimetableSlot {
  slotId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  room: string;
}

export interface AppNotification {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  linkTo?: string;
}

export interface SystemConfig {
  institutionName: string;
  academicYear: string;
  currentSemester: string;
  defaultThresholdPercentage: number;
  lateAllowanceMinutes: number;
  qrTokenExpirySeconds: number;
  awsRegion: string;
  cognitoUserPoolId: string;
  apiGatewayBaseUrl: string;
  s3ReportBucket: string;
  dynamoDbTablePrefix: string;
  cloudWatchLogGroup: string;
  demoMode: boolean;
}

export interface StudentAttendanceSummary {
  subject: Subject;
  totalHeld: number;
  attended: number;
  absent: number;
  late: number;
  percentage: number;
  threshold: number;
  isLow: boolean;
  classesNeededForTarget: number;
  classesCanMiss: number;
}
