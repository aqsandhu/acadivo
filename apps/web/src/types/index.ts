export type UserRole = "superAdmin" | "principal" | "admin" | "teacher" | "student" | "parent";

export interface User {
  id: string;
  uniqueId: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  schoolId?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  userId: string;
  user: User;
  employeeId: string;
  qualification: string;
  specialization: string;
  joiningDate: string;
  salary: number;
  subjects: Subject[];
  classes: Class[];
}

export interface Student {
  id: string;
  userId: string;
  user: User;
  rollNumber: string;
  admissionDate: string;
  classId: string;
  class: Class;
  sectionId: string;
  section: Section;
  parentId?: string;
  parent?: Parent;
  guardianName?: string;
  guardianPhone?: string;
  dateOfBirth?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: string;
}

export interface Parent {
  id: string;
  userId: string;
  user: User;
  children: Student[];
  occupation?: string;
  cnic?: string;
}

export interface Principal {
  id: string;
  userId: string;
  user: User;
  experience?: string;
  qualification?: string;
}

export interface Admin {
  id: string;
  userId: string;
  user: User;
  permissions: string[];
}

export interface SuperAdmin {
  id: string;
  userId: string;
  user: User;
}

export interface School {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  website?: string;
  establishedYear?: number;
  principalId?: string;
  principal?: Principal;
  status: "active" | "inactive" | "suspended";
  plan: "free" | "basic" | "premium" | "enterprise";
  planExpiry?: string;
  maxStudents: number;
  maxTeachers: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  schoolId: string;
  school: School;
  domain?: string;
  settings: Record<string, unknown>;
}

export interface Class {
  id: string;
  name: string;
  level: number;
  schoolId: string;
  school: School;
  sections: Section[];
  subjects: Subject[];
  classTeacherId?: string;
  classTeacher?: Teacher;
}

export interface Section {
  id: string;
  name: string;
  classId: string;
  class: Class;
  students: Student[];
  roomNumber?: string;
  capacity: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  schoolId: string;
  classes: Class[];
  teachers: Teacher[];
}

export interface Attendance {
  id: string;
  studentId: string;
  student: Student;
  classId: string;
  sectionId: string;
  date: string;
  status: "present" | "absent" | "late" | "leave" | "holiday";
  remarks?: string;
  markedById: string;
  markedBy: Teacher;
  createdAt: string;
}

export interface Homework {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  subject: Subject;
  classId: string;
  class: Class;
  sectionId?: string;
  section?: Section;
  teacherId: string;
  teacher: Teacher;
  dueDate: string;
  attachmentUrl?: string;
  maxMarks?: number;
  status: "active" | "draft" | "closed";
  createdAt: string;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  homework: Homework;
  studentId: string;
  student: Student;
  submissionDate: string;
  content?: string;
  attachmentUrl?: string;
  marks?: number;
  remarks?: string;
  status: "submitted" | "late" | "graded" | "missing";
  gradedById?: string;
  gradedBy?: Teacher;
  gradedAt?: string;
}

export interface Mark {
  id: string;
  studentId: string;
  student: Student;
  subjectId: string;
  subject: Subject;
  classId: string;
  sectionId: string;
  examType: "quiz" | "midterm" | "final" | "assignment" | "project" | "oral";
  totalMarks: number;
  obtainedMarks: number;
  percentage?: number;
  grade?: string;
  remarks?: string;
  date: string;
  teacherId: string;
  teacher: Teacher;
}

export interface Result {
  id: string;
  studentId: string;
  student: Student;
  classId: string;
  sectionId: string;
  examType: "midterm" | "final" | "annual";
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  status: "pass" | "fail" | "promoted";
  position?: number;
  remarks?: string;
  academicYear: string;
  createdAt: string;
}

export interface ResultDetail {
  id: string;
  resultId: string;
  result: Result;
  subjectId: string;
  subject: Subject;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  remarks?: string;
}

export interface TimetableEntry {
  id: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  subject: Subject;
  teacherId: string;
  teacher: Teacher;
  dayOfWeek: number; // 0=Sunday, 1=Monday...
  period: number;
  startTime: string;
  endTime: string;
  roomNumber?: string;
}

export interface Message {
  id: string;
  senderId: string;
  sender: User;
  receiverId?: string;
  receiver?: User;
  groupId?: string;
  content: string;
  attachmentUrl?: string;
  isRead: boolean;
  readAt?: string;
  parentMessageId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "info" | "success" | "warning" | "error";
  category: "attendance" | "homework" | "marks" | "fee" | "announcement" | "message" | "general";
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: User;
  schoolId?: string;
  targetRoles?: UserRole[];
  targetClassIds?: string[];
  targetSectionIds?: string[];
  attachmentUrl?: string;
  isPinned: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface FeeStructure {
  id: string;
  schoolId: string;
  classId?: string;
  name: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "half-yearly" | "annually" | "one-time";
  isMandatory: boolean;
  dueDay: number;
  description?: string;
  academicYear: string;
  isActive: boolean;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  student: Student;
  feeStructureId: string;
  feeStructure: FeeStructure;
  amount: number;
  discount?: number;
  paidAmount: number;
  balance: number;
  status: "paid" | "unpaid" | "partial" | "overdue";
  dueDate: string;
  paidDate?: string;
  paymentMethod?: "cash" | "bank_transfer" | "cheque" | "card" | "online";
  transactionId?: string;
  remarks?: string;
  createdAt: string;
}

export interface ReportRequest {
  id: string;
  requesterId: string;
  requester: User;
  reportType: "attendance" | "marks" | "fee" | "student" | "teacher" | "general";
  filters: Record<string, unknown>;
  format: "pdf" | "excel" | "csv";
  status: "pending" | "processing" | "completed" | "failed";
  fileUrl?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position: "sidebar" | "banner" | "footer" | "popup";
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
  impressions: number;
  clicks: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  attendanceToday: number;
  attendancePercentage: number;
  feeCollected: number;
  feePending: number;
  homeworkPending: number;
  announcementsCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LoginCredentials {
  uniqueId: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface PasswordResetRequest {
  email?: string;
  phone?: string;
}

export interface PasswordResetConfirm {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface OTPVerifyRequest {
  phone?: string;
  email?: string;
  otp: string;
  purpose: "login" | "reset_password" | "parent_setup" | "registration";
}

export interface ParentSetupData {
  studentId: string;
  phone: string;
  otp: string;
  password: string;
  confirmPassword: string;
}


export interface Conversation {
  id: string;
  participantIds?: string[];
  participantId?: string;
  participants?: User[];
  participantName: string;
  participantRole?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageItem {
  id: string;
  conversationId?: string;
  senderId: string;
  sender?: User;
  content: string;
  attachmentUrl?: string;
  isRead?: boolean;
  read?: boolean;
  readAt?: string;
  createdAt?: string;
  timestamp?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: "info" | "success" | "warning" | "error";
  category: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  status: "present" | "absent" | "late" | "leave";
  remarks?: string;
}

export interface TimetableSlot {
  id: string;
  dayOfWeek: number;
  period: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  roomNumber?: string;
}

export interface ResultItem {
  id: string;
  examType: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  status: string;
  subjectResults: {
    subject: string;
    totalMarks: number;
    obtainedMarks: number;
    grade: string;
  }[];
}

export interface HomeworkItem {
  id: string;
  title: string;
  description?: string;
  subject: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded" | "late";
  marks?: number;
  feedback?: string;
  attachmentUrl?: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  sectionName: string;
  attendance: number;
  currentMarks: number;
}

export interface QAItem {
  id: string;
  question: string;
  askedBy: string;
  askedAt: string;
  answer?: string;
  answeredBy?: string;
  answeredAt?: string;
  isPublic: boolean;
  status: "pending" | "answered" | "rejected";
}

export interface MarkEntry {
  studentId: string;
  studentName: string;
  rollNumber: string;
  obtainedMarks: number;
  totalMarks: number;
  percentage?: number;
  grade?: string;
  remarks?: string;
}

export interface ClassItem {
  id: string;
  name: string;
  level: number;
  sectionCount: number;
  studentCount: number;
  classTeacherName?: string;
}
