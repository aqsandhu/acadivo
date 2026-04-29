// ═══════════════════════════════════════════════════════════════
// Mock API Service for Acadivo Admin Dashboards
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";

// ── Types ──

export interface School {
  id: string;
  name: string;
  code: string;
  city: string;
  type: "GOVERNMENT" | "PRIVATE" | "SEMI_PRIVATE";
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  plan: string;
  principalName: string;
  principalEmail: string;
  principalPhone: string;
  maxUsers: number;
  userCount: number;
  revenue: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  schoolId?: string;
  schoolName?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface Teacher {
  id: string;
  uniqueId: string;
  name: string;
  email: string;
  phone: string;
  qualifications: string;
  subjects: string[];
  assignedClasses: string[];
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface Student {
  id: string;
  uniqueId: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string;
  parentName: string;
  parentPhone: string;
  attendancePercent: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface Parent {
  id: string;
  uniqueId: string;
  name: string;
  email: string;
  phone: string;
  children: string[];
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  maxUsers: number;
  features: string[];
  schoolCount: number;
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  targetAudience: string[];
  targetCities: string[];
  targetSchoolTypes: string[];
  startDate: string;
  endDate: string;
  priority: number;
  impressions: number;
  clicks: number;
  status: "ACTIVE" | "INACTIVE";
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: string[];
  priority: "LOW" | "MEDIUM" | "HIGH";
  pinned: boolean;
  expiryDate?: string;
  createdAt: string;
}

export interface FeeStructure {
  id: string;
  type: string;
  amount: number;
  frequency: "MONTHLY" | "QUARTERLY" | "ANNUALLY";
  dueDay: number;
  lateFee: number;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  structureId: string;
  amount: number;
  paid: number;
  due: number;
  status: "PAID" | "PARTIAL" | "UNPAID";
  month: string;
}

export interface ClassSection {
  id: string;
  name: string;
  sections: string[];
  teacherId?: string;
  teacherName?: string;
  studentCount: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacherIds: string[];
  teacherNames: string[];
}

export interface AttendanceRecord {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  class: string;
  section: string;
  status: "PRESENT" | "ABSENT" | "LATE";
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  targetAudience: string;
  targetIds?: string[];
  sentAt: string;
  readCount: number;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface TimetableSlot {
  day: string;
  period: number;
  subject: string;
  teacher: string;
}

export interface StatsCard {
  label: string;
  value: number | string;
  change?: number;
  icon?: string;
}

export interface DashboardStats {
  totalSchools: number;
  activeSchools: number;
  totalUsers: number;
  monthlyRevenue: number;
  messagesSentToday: number;
  newSignups: number;
}

export interface PrincipalStats {
  totalTeachers: number;
  totalStudents: number;
  totalParents: number;
  attendanceToday: number;
  feeCollectionThisMonth: number;
  pendingReports: number;
}

export interface AdminStats {
  teachers: number;
  students: number;
  parents: number;
  classes: number;
  pendingFee: number;
  attendanceToday: number;
}

// ── Constants ──

const CITIES = ["Lahore", "Karachi", "Islamabad", "Faisalabad", "Rawalpindi", "Peshawar", "Multan"];
const SCHOOL_TYPES = ["GOVERNMENT", "PRIVATE", "SEMI_PRIVATE"] as const;
const SCHOOL_NAMES = [
  "Government High School Lahore",
  "Allama Iqbal Public School",
  "The City School",
  "Beaconhouse School System",
  "Faisalabad Grammar School",
  "Army Public School Rawalpindi",
  "Edwards College Peshawar",
  "Multan Public School",
  "Karachi Grammar School",
  "Islamabad College for Boys",
];

const FIRST_NAMES = [
  "Ali", "Ahmed", "Muhammad", "Hassan", "Hussain", "Omar", "Usman", "Bilal", "Farhan", "Imran",
  "Fatima", "Aisha", "Maryam", "Hira", "Sana", "Zara", "Nida", "Rabia", "Khadija", "Ayesha",
  "Ibrahim", "Ismail", "Yusuf", "Zain", "Daniyal", "Hamza", "Saad", "Salman", "Tariq", "Waqar",
];
const LAST_NAMES = [
  "Khan", "Ahmed", "Ali", "Hussain", "Malik", "Sheikh", "Qureshi", "Butt", "Raza", "Javed",
  "Iqbal", "Rehman", "Aslam", "Siddiqui", "Mirza", "Awan", "Chaudhry", "Gill", "Anwar", "Mehmood",
];

const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English", "Urdu", "Islamiat", "Pak Studies", "Computer Science"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function genId(prefix: string, num: number): string {
  return `${prefix}-${String.fromCharCode(65 + randInt(0, 25))}${String.fromCharCode(65 + randInt(0, 25))}${String.fromCharCode(65 + randInt(0, 25))}-${String(num).padStart(3, "0")}`;
}

function generateName(): string {
  return `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`;
}

// ── Mock Data Generators ──

export const mockSchools: School[] = Array.from({ length: 10 }).map((_, i) => {
  const city = CITIES[i % CITIES.length];
  const status = i < 8 ? "ACTIVE" : i === 8 ? "PENDING" : "SUSPENDED";
  const plans = ["Basic", "Standard", "Premium", "Enterprise"];
  const plan = rand(plans);
  const userCount = randInt(50, 500);
  return {
    id: `sch-${i + 1}`,
    name: SCHOOL_NAMES[i],
    code: `SCH-${city.slice(0, 3).toUpperCase()}-${100 + i}`,
    city,
    type: rand(SCHOOL_TYPES),
    status,
    plan,
    principalName: generateName(),
    principalEmail: `principal${i + 1}@school.edu.pk`,
    principalPhone: `+92 3${randInt(0, 9)}${randInt(0, 9)} ${randInt(100, 999)} ${randInt(1000, 9999)}`,
    maxUsers: plan === "Basic" ? 100 : plan === "Standard" ? 300 : plan === "Premium" ? 1000 : 5000,
    userCount,
    revenue: userCount * (plan === "Basic" ? 500 : plan === "Standard" ? 1500 : plan === "Premium" ? 3000 : 5000),
    createdAt: new Date(Date.now() - randInt(1, 365) * 86400000).toISOString(),
  };
});

export const mockUsers: User[] = Array.from({ length: 50 }).map((_, i) => {
  const school = rand(mockSchools);
  const roles = ["ADMIN", "TEACHER", "STUDENT", "PARENT", "PRINCIPAL"];
  return {
    id: `usr-${i + 1}`,
    name: generateName(),
    email: `user${i + 1}@acadivo.pk`,
    phone: `+92 3${randInt(0, 9)}${randInt(0, 9)} ${randInt(100, 999)} ${randInt(1000, 9999)}`,
    role: rand(roles),
    schoolId: school.id,
    schoolName: school.name,
    status: Math.random() > 0.1 ? "ACTIVE" : "INACTIVE",
    createdAt: new Date(Date.now() - randInt(1, 180) * 86400000).toISOString(),
  };
});

export const mockTeachers: Teacher[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `tch-${i + 1}`,
  uniqueId: genId("TCH", i + 1),
  name: generateName(),
  email: `teacher${i + 1}@school.edu.pk`,
  phone: `+92 3${randInt(0, 9)}${randInt(0, 9)} ${randInt(100, 999)} ${randInt(1000, 9999)}`,
  qualifications: rand(["B.Ed", "M.Ed", "BS", "MS", "MPhil"]),
  subjects: [rand(SUBJECTS), rand(SUBJECTS)],
  assignedClasses: [`Class ${randInt(1, 10)}`],
  status: Math.random() > 0.15 ? "ACTIVE" : "INACTIVE",
  createdAt: new Date(Date.now() - randInt(1, 365) * 86400000).toISOString(),
}));

export const mockStudents: Student[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `std-${i + 1}`,
  uniqueId: genId("STD", i + 1),
  name: generateName(),
  class: `Class ${randInt(1, 10)}`,
  section: rand(["A", "B", "C"]),
  rollNumber: String(randInt(1, 50)),
  parentName: generateName(),
  parentPhone: `+92 3${randInt(0, 9)}${randInt(0, 9)} ${randInt(100, 999)} ${randInt(1000, 9999)}`,
  attendancePercent: randInt(70, 100),
  status: Math.random() > 0.1 ? "ACTIVE" : "INACTIVE",
  createdAt: new Date(Date.now() - randInt(1, 365) * 86400000).toISOString(),
}));

export const mockParents: Parent[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `par-${i + 1}`,
  uniqueId: genId("PAR", i + 1),
  name: generateName(),
  email: `parent${i + 1}@email.com`,
  phone: `+92 3${randInt(0, 9)}${randInt(0, 9)} ${randInt(100, 999)} ${randInt(1000, 9999)}`,
  children: [rand(mockStudents).name, randInt(0, 1) ? rand(mockStudents).name : undefined].filter(Boolean) as string[],
  status: Math.random() > 0.1 ? "ACTIVE" : "INACTIVE",
  createdAt: new Date(Date.now() - randInt(1, 365) * 86400000).toISOString(),
}));

export const mockSubscriptionPlans: SubscriptionPlan[] = [
  { id: "plan-1", name: "Basic", price: 500, maxUsers: 100, features: ["Up to 100 users", "Basic reports", "Email support"], schoolCount: 3 },
  { id: "plan-2", name: "Standard", price: 1500, maxUsers: 300, features: ["Up to 300 users", "Advanced reports", "Priority support", "SMS notifications"], schoolCount: 4 },
  { id: "plan-3", name: "Premium", price: 3000, maxUsers: 1000, features: ["Up to 1000 users", "Full analytics", "24/7 support", "Custom branding"], schoolCount: 2 },
  { id: "plan-4", name: "Enterprise", price: 5000, maxUsers: 5000, features: ["Unlimited users", "Dedicated manager", "API access", "White-label"], schoolCount: 1 },
];

export const mockAdvertisements: Advertisement[] = Array.from({ length: 8 }).map((_, i) => {
  const impressions = randInt(1000, 50000);
  const clicks = randInt(50, impressions / 2);
  return {
    id: `ad-${i + 1}`,
    title: `Ad Campaign ${i + 1}`,
    description: "Promotional content for educational services across Pakistan.",
    targetAudience: rand(["ALL", "TEACHERS", "STUDENTS", "PARENTS"]).split(" "),
    targetCities: [rand(CITIES)],
    targetSchoolTypes: [rand(SCHOOL_TYPES)],
    startDate: new Date(Date.now() - randInt(1, 30) * 86400000).toISOString(),
    endDate: new Date(Date.now() + randInt(1, 60) * 86400000).toISOString(),
    priority: randInt(1, 5),
    impressions,
    clicks,
    status: Math.random() > 0.3 ? "ACTIVE" : "INACTIVE",
  };
});

export const mockAnnouncements: Announcement[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `ann-${i + 1}`,
  title: rand(["Exam Schedule", "Fee Deadline", "New Policy", "Holiday Notice", "Sports Day", "Parent Meeting"]),
  content: "Please note the important updates regarding school operations and upcoming events.",
  targetAudience: rand([["ALL"], ["TEACHERS"], ["STUDENTS"], ["PARENTS"], ["TEACHERS", "STUDENTS"]]),
  priority: rand(["LOW", "MEDIUM", "HIGH"]),
  pinned: i < 3,
  expiryDate: new Date(Date.now() + randInt(1, 30) * 86400000).toISOString(),
  createdAt: new Date(Date.now() - randInt(1, 60) * 86400000).toISOString(),
}));

export const mockFeeStructures: FeeStructure[] = [
  { id: "fs-1", type: "Tuition Fee", amount: 2500, frequency: "MONTHLY", dueDay: 10, lateFee: 200 },
  { id: "fs-2", type: "Admission Fee", amount: 5000, frequency: "ANNUALLY", dueDay: 1, lateFee: 500 },
  { id: "fs-3", type: "Examination Fee", amount: 1500, frequency: "QUARTERLY", dueDay: 15, lateFee: 100 },
  { id: "fs-4", type: "Computer Lab Fee", amount: 800, frequency: "MONTHLY", dueDay: 10, lateFee: 100 },
];

export const mockFeeRecords: FeeRecord[] = Array.from({ length: 40 }).map((_, i) => {
  const student = rand(mockStudents);
  const structure = rand(mockFeeStructures);
  const paid = Math.random() > 0.3 ? structure.amount : randInt(0, structure.amount);
  return {
    id: `fr-${i + 1}`,
    studentId: student.id,
    studentName: student.name,
    structureId: structure.id,
    amount: structure.amount,
    paid,
    due: structure.amount - paid,
    status: paid === structure.amount ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID",
    month: new Date(Date.now() - randInt(0, 11) * 30 * 86400000).toLocaleString("en", { month: "long" }),
  };
});

export const mockClasses: ClassSection[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `cls-${i + 1}`,
  name: `Class ${i + 1}`,
  sections: i < 5 ? ["A", "B"] : ["A"],
  teacherId: rand(mockTeachers).id,
  teacherName: rand(mockTeachers).name,
  studentCount: randInt(20, 40),
}));

export const mockSubjects: Subject[] = SUBJECTS.map((name, i) => ({
  id: `sub-${i + 1}`,
  name,
  code: name.slice(0, 3).toUpperCase(),
  teacherIds: [rand(mockTeachers).id],
  teacherNames: [rand(mockTeachers).name],
}));

export const mockAttendance: AttendanceRecord[] = Array.from({ length: 100 }).map((_, i) => {
  const student = rand(mockStudents);
  return {
    id: `att-${i + 1}`,
    date: new Date(Date.now() - randInt(0, 30) * 86400000).toISOString().split("T")[0],
    studentId: student.id,
    studentName: student.name,
    class: student.class,
    section: student.section,
    status: rand(["PRESENT", "ABSENT", "LATE"]),
  };
});

export const mockConversations: Conversation[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `conv-${i + 1}`,
  participantId: `usr-${i + 1}`,
  participantName: generateName(),
  participantRole: rand(["TEACHER", "PARENT", "ADMIN"]),
  lastMessage: "Please review the attached document.",
  lastMessageTime: new Date(Date.now() - randInt(1, 24) * 3600000).toISOString(),
  unreadCount: randInt(0, 5),
}));

export const mockMessages: Message[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `msg-${i + 1}`,
  senderId: i % 2 === 0 ? "me" : `usr-${randInt(1, 5)}`,
  senderName: i % 2 === 0 ? "Me" : generateName(),
  receiverId: i % 2 === 0 ? `usr-${randInt(1, 5)}` : "me",
  receiverName: i % 2 === 0 ? generateName() : "Me",
  content: rand(["Hello, how are you?", "Meeting at 3 PM", "Please submit the report.", "Fee reminder", "Attendance is low this month.", "Great job on the exam!"]),
  timestamp: new Date(Date.now() - randInt(1, 48) * 3600000).toISOString(),
  read: Math.random() > 0.5,
}));

export const mockNotifications: NotificationItem[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `notif-${i + 1}`,
  title: rand(["Fee Reminder", "Meeting Alert", "Exam Schedule", "Holiday Notice", "System Update"]),
  body: "This is a sample notification body for testing purposes.",
  targetAudience: rand(["ALL", "TEACHERS", "STUDENTS", "PARENTS"]),
  sentAt: new Date(Date.now() - randInt(1, 7) * 86400000).toISOString(),
  readCount: randInt(10, 100),
}));

// ── API Functions ──

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await delay();
  return {
    totalSchools: mockSchools.length,
    activeSchools: mockSchools.filter((s) => s.status === "ACTIVE").length,
    totalUsers: mockUsers.length,
    monthlyRevenue: mockSchools.reduce((sum, s) => sum + s.revenue, 0),
    messagesSentToday: randInt(100, 500),
    newSignups: randInt(5, 30),
  };
}

export async function getPrincipalStats(): Promise<PrincipalStats> {
  await delay();
  return {
    totalTeachers: mockTeachers.length,
    totalStudents: mockStudents.length,
    totalParents: mockParents.length,
    attendanceToday: randInt(85, 98),
    feeCollectionThisMonth: mockFeeRecords.filter((r) => r.status === "PAID").reduce((s, r) => s + r.paid, 0),
    pendingReports: randInt(2, 10),
  };
}

export async function getAdminStats(): Promise<AdminStats> {
  await delay();
  return {
    teachers: mockTeachers.length,
    students: mockStudents.length,
    parents: mockParents.length,
    classes: mockClasses.length,
    pendingFee: mockFeeRecords.filter((r) => r.status !== "PAID").reduce((s, r) => s + r.due, 0),
    attendanceToday: randInt(85, 98),
  };
}

export async function getSchools(params?: { search?: string; city?: string; status?: string; plan?: string }): Promise<School[]> {
  await delay();
  let data = [...mockSchools];
  if (params?.search) {
    const q = params.search.toLowerCase();
    data = data.filter((s) => s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q));
  }
  if (params?.city) data = data.filter((s) => s.city === params.city);
  if (params?.status) data = data.filter((s) => s.status === params.status);
  if (params?.plan) data = data.filter((s) => s.plan === params.plan);
  return data;
}

export async function getSchoolById(id: string): Promise<School | undefined> {
  await delay();
  return mockSchools.find((s) => s.id === id);
}

export async function createSchool(data: Partial<School>): Promise<School> {
  await delay(500);
  const school: School = {
    id: `sch-${mockSchools.length + 1}`,
    name: data.name || "New School",
    code: data.code || `SCH-NEW-${mockSchools.length + 1}`,
    city: data.city || "Lahore",
    type: data.type || "PRIVATE",
    status: "ACTIVE",
    plan: data.plan || "Basic",
    principalName: data.principalName || generateName(),
    principalEmail: data.principalEmail || "principal@school.edu.pk",
    principalPhone: data.principalPhone || "+92 300 000 0000",
    maxUsers: 100,
    userCount: 0,
    revenue: 0,
    createdAt: new Date().toISOString(),
  };
  mockSchools.push(school);
  return school;
}

export async function updateSchool(id: string, data: Partial<School>): Promise<School | undefined> {
  await delay(500);
  const idx = mockSchools.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  mockSchools[idx] = { ...mockSchools[idx], ...data };
  return mockSchools[idx];
}

export async function deleteSchool(id: string): Promise<boolean> {
  await delay(500);
  const idx = mockSchools.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  mockSchools.splice(idx, 1);
  return true;
}

export async function getUsers(params?: { search?: string; role?: string; schoolId?: string; status?: string }): Promise<User[]> {
  await delay();
  let data = [...mockUsers];
  if (params?.search) {
    const q = params.search.toLowerCase();
    data = data.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  if (params?.role) data = data.filter((u) => u.role === params.role);
  if (params?.schoolId) data = data.filter((u) => u.schoolId === params.schoolId);
  if (params?.status) data = data.filter((u) => u.status === params.status);
  return data;
}

export async function getTeachers(params?: { search?: string; status?: string }): Promise<Teacher[]> {
  await delay();
  let data = [...mockTeachers];
  if (params?.search) {
    const q = params.search.toLowerCase();
    data = data.filter((t) => t.name.toLowerCase().includes(q) || t.uniqueId.toLowerCase().includes(q));
  }
  if (params?.status) data = data.filter((t) => t.status === params.status);
  return data;
}

export async function createTeacher(data: Partial<Teacher>): Promise<Teacher> {
  await delay(500);
  const teacher: Teacher = {
    id: `tch-${mockTeachers.length + 1}`,
    uniqueId: genId("TCH", mockTeachers.length + 1),
    name: data.name || generateName(),
    email: data.email || "teacher@school.edu.pk",
    phone: data.phone || "+92 300 000 0000",
    qualifications: data.qualifications || "B.Ed",
    subjects: data.subjects || ["Math"],
    assignedClasses: data.assignedClasses || ["Class 1"],
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };
  mockTeachers.push(teacher);
  return teacher;
}

export async function updateTeacher(id: string, data: Partial<Teacher>): Promise<Teacher | undefined> {
  await delay(500);
  const idx = mockTeachers.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  mockTeachers[idx] = { ...mockTeachers[idx], ...data };
  return mockTeachers[idx];
}

export async function deleteTeacher(id: string): Promise<boolean> {
  await delay(500);
  const idx = mockTeachers.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  mockTeachers.splice(idx, 1);
  return true;
}

export async function getStudents(params?: { search?: string; class?: string; section?: string; status?: string }): Promise<Student[]> {
  await delay();
  let data = [...mockStudents];
  if (params?.search) {
    const q = params.search.toLowerCase();
    data = data.filter((s) => s.name.toLowerCase().includes(q) || s.uniqueId.toLowerCase().includes(q));
  }
  if (params?.class) data = data.filter((s) => s.class === params.class);
  if (params?.section) data = data.filter((s) => s.section === params.section);
  if (params?.status) data = data.filter((s) => s.status === params.status);
  return data;
}

export async function createStudent(data: Partial<Student>): Promise<Student> {
  await delay(500);
  const student: Student = {
    id: `std-${mockStudents.length + 1}`,
    uniqueId: genId("STD", mockStudents.length + 1),
    name: data.name || generateName(),
    class: data.class || "Class 1",
    section: data.section || "A",
    rollNumber: data.rollNumber || String(mockStudents.length + 1),
    parentName: data.parentName || generateName(),
    parentPhone: data.parentPhone || "+92 300 000 0000",
    attendancePercent: 100,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };
  mockStudents.push(student);
  return student;
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<Student | undefined> {
  await delay(500);
  const idx = mockStudents.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  mockStudents[idx] = { ...mockStudents[idx], ...data };
  return mockStudents[idx];
}

export async function deleteStudent(id: string): Promise<boolean> {
  await delay(500);
  const idx = mockStudents.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  mockStudents.splice(idx, 1);
  return true;
}

export async function getParents(params?: { search?: string; status?: string }): Promise<Parent[]> {
  await delay();
  let data = [...mockParents];
  if (params?.search) {
    const q = params.search.toLowerCase();
    data = data.filter((p) => p.name.toLowerCase().includes(q) || p.uniqueId.toLowerCase().includes(q));
  }
  if (params?.status) data = data.filter((p) => p.status === params.status);
  return data;
}

export async function createParent(data: Partial<Parent>): Promise<Parent> {
  await delay(500);
  const parent: Parent = {
    id: `par-${mockParents.length + 1}`,
    uniqueId: genId("PAR", mockParents.length + 1),
    name: data.name || generateName(),
    email: data.email || "parent@email.com",
    phone: data.phone || "+92 300 000 0000",
    children: data.children || [],
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };
  mockParents.push(parent);
  return parent;
}

export async function updateParent(id: string, data: Partial<Parent>): Promise<Parent | undefined> {
  await delay(500);
  const idx = mockParents.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  mockParents[idx] = { ...mockParents[idx], ...data };
  return mockParents[idx];
}

export async function deleteParent(id: string): Promise<boolean> {
  await delay(500);
  const idx = mockParents.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  mockParents.splice(idx, 1);
  return true;
}

export async function getClasses(): Promise<ClassSection[]> {
  await delay();
  return [...mockClasses];
}

export async function createClass(data: Partial<ClassSection>): Promise<ClassSection> {
  await delay(500);
  const cls: ClassSection = {
    id: `cls-${mockClasses.length + 1}`,
    name: data.name || `Class ${mockClasses.length + 1}`,
    sections: data.sections || ["A"],
    teacherId: data.teacherId,
    teacherName: data.teacherName,
    studentCount: 0,
  };
  mockClasses.push(cls);
  return cls;
}

export async function getSubjects(): Promise<Subject[]> {
  await delay();
  return [...mockSubjects];
}

export async function getFeeStructures(): Promise<FeeStructure[]> {
  await delay();
  return [...mockFeeStructures];
}

export async function createFeeStructure(data: Partial<FeeStructure>): Promise<FeeStructure> {
  await delay(500);
  const fs: FeeStructure = {
    id: `fs-${mockFeeStructures.length + 1}`,
    type: data.type || "New Fee",
    amount: data.amount || 1000,
    frequency: data.frequency || "MONTHLY",
    dueDay: data.dueDay || 10,
    lateFee: data.lateFee || 100,
  };
  mockFeeStructures.push(fs);
  return fs;
}

export async function getFeeRecords(params?: { studentId?: string; status?: string }): Promise<FeeRecord[]> {
  await delay();
  let data = [...mockFeeRecords];
  if (params?.studentId) data = data.filter((r) => r.studentId === params.studentId);
  if (params?.status) data = data.filter((r) => r.status === params.status);
  return data;
}

export async function getAttendance(params?: { date?: string; class?: string; section?: string }): Promise<AttendanceRecord[]> {
  await delay();
  let data = [...mockAttendance];
  if (params?.date) data = data.filter((a) => a.date === params.date);
  if (params?.class) data = data.filter((a) => a.class === params.class);
  if (params?.section) data = data.filter((a) => a.section === params.section);
  return data;
}

export async function getAnnouncements(): Promise<Announcement[]> {
  await delay();
  return [...mockAnnouncements].sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));
}

export async function createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
  await delay(500);
  const ann: Announcement = {
    id: `ann-${mockAnnouncements.length + 1}`,
    title: data.title || "New Announcement",
    content: data.content || "",
    targetAudience: data.targetAudience || ["ALL"],
    priority: data.priority || "MEDIUM",
    pinned: data.pinned || false,
    expiryDate: data.expiryDate,
    createdAt: new Date().toISOString(),
  };
  mockAnnouncements.push(ann);
  return ann;
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  await delay(500);
  const idx = mockAnnouncements.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  mockAnnouncements.splice(idx, 1);
  return true;
}

export async function getAdvertisements(): Promise<Advertisement[]> {
  await delay();
  return [...mockAdvertisements];
}

export async function createAdvertisement(data: Partial<Advertisement>): Promise<Advertisement> {
  await delay(500);
  const ad: Advertisement = {
    id: `ad-${mockAdvertisements.length + 1}`,
    title: data.title || "New Ad",
    description: data.description || "",
    targetAudience: data.targetAudience || ["ALL"],
    targetCities: data.targetCities || ["Lahore"],
    targetSchoolTypes: data.targetSchoolTypes || ["PRIVATE"],
    startDate: data.startDate || new Date().toISOString(),
    endDate: data.endDate || new Date().toISOString(),
    priority: data.priority || 1,
    impressions: 0,
    clicks: 0,
    status: "ACTIVE",
  };
  mockAdvertisements.push(ad);
  return ad;
}

export async function updateAdvertisement(id: string, data: Partial<Advertisement>): Promise<Advertisement | undefined> {
  await delay(500);
  const idx = mockAdvertisements.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  mockAdvertisements[idx] = { ...mockAdvertisements[idx], ...data };
  return mockAdvertisements[idx];
}

export async function deleteAdvertisement(id: string): Promise<boolean> {
  await delay(500);
  const idx = mockAdvertisements.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  mockAdvertisements.splice(idx, 1);
  return true;
}

export async function getSubscriptions(): Promise<SubscriptionPlan[]> {
  await delay();
  return [...mockSubscriptionPlans];
}

export async function getConversations(): Promise<Conversation[]> {
  await delay();
  return [...mockConversations];
}

export async function getMessages(conversationId?: string): Promise<Message[]> {
  await delay();
  return [...mockMessages];
}

export async function getNotifications(): Promise<NotificationItem[]> {
  await delay();
  return [...mockNotifications];
}

// ── Hook Helpers ──

export function useMockApi<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
