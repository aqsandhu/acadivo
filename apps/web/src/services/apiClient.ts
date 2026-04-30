import api from "./api";
import { useState, useEffect, useCallback } from "react";
import type {
  ApiResponse,
  AuthTokens,
  LoginCredentials,
  User,
  School,
  Teacher,
  Student,
  Parent,
  Class,
  Section,
  Subject,
  Attendance,
  Homework,
  HomeworkSubmission,
  Mark,
  Result,
  TimetableEntry,
  Message,
  Notification,
  Announcement,
  FeeStructure,
  FeeRecord,
  ReportRequest,
  Advertisement,
  Conversation,
  DashboardStats,
  PasswordResetRequest,
  PasswordResetConfirm,
  OTPVerifyRequest,
  ParentSetupData,
} from "@/types";

// ───────────────────────────────────────────────────────────────
// Real API Client — replaces all mock data with live API calls
// ───────────────────────────────────────────────────────────────

/* ── Auth ── */

async function login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
  const res = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>("/auth/login", credentials);
  return res.data;
}

async function logout(): Promise<ApiResponse<void>> {
  const res = await api.post<ApiResponse<void>>("/auth/logout", {});
  return res.data;
}

async function getMe(): Promise<ApiResponse<User>> {
  const res = await api.get<ApiResponse<User>>("/auth/me");
  return res.data;
}

async function refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
  const res = await api.post<ApiResponse<AuthTokens>>("/auth/refresh", { refreshToken });
  return res.data;
}

async function forgotPassword(data: PasswordResetRequest): Promise<ApiResponse<void>> {
  const res = await api.post<ApiResponse<void>>("/auth/forgot-password", data);
  return res.data;
}

async function resetPassword(data: PasswordResetConfirm): Promise<ApiResponse<void>> {
  const res = await api.post<ApiResponse<void>>("/auth/reset-password", data);
  return res.data;
}

async function verifyOTP(data: OTPVerifyRequest): Promise<ApiResponse<{ verified: boolean }>> {
  const res = await api.post<ApiResponse<{ verified: boolean }>>("/auth/verify-otp", data);
  return res.data;
}

async function setupParentPassword(data: ParentSetupData): Promise<ApiResponse<void>> {
  const res = await api.post<ApiResponse<void>>("/auth/setup-parent-password", data);
  return res.data;
}

async function changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
  const res = await api.post<ApiResponse<void>>("/auth/change-password", data);
  return res.data;
}

async function updateProfile(data: Partial<User> & { avatar?: File }): Promise<ApiResponse<User>> {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });
  const res = await api.put<ApiResponse<User>>("/auth/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/* ── Consumer Advertisements ── */

async function getConsumerAdvertisements(): Promise<Advertisement[]> {
  const res = await api.get<ApiResponse<Advertisement[]>>("/v1/advertisement/consumer");
  return res.data.data || [];
}

async function trackAdClick(adId: string): Promise<void> {
  await api.post<ApiResponse<void>>(`/v1/advertisement/consumer/${adId}/click`, {});
}

/* ── Settings ── */

async function getUserSettings(): Promise<Record<string, any>> {
  const res = await api.get<ApiResponse<Record<string, any>>>("/auth/settings");
  return res.data.data || {};
}

async function updateUserSettings(data: Record<string, any>): Promise<Record<string, any>> {
  const res = await api.put<ApiResponse<Record<string, any>>>("/auth/settings", data);
  return res.data.data || {};
}

/* ── Super Admin ── */

async function getDashboardStats(): Promise<DashboardStats> {
  const res = await api.get<ApiResponse<DashboardStats>>("/super-admin/dashboard");
  return res.data.data!;
}

async function getSchools(params?: { search?: string; city?: string; status?: string; plan?: string }): Promise<School[]> {
  const res = await api.get<ApiResponse<School[]>>('/super-admin/schools', { params });
  return res.data.data || [];
}

async function getSchoolById(id: string): Promise<School | undefined> {
  const res = await api.get<ApiResponse<School>>(`/super-admin/schools/${id}`);
  return res.data.data;
}

async function createSchool(data: Partial<School>): Promise<School> {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) formData.append(key, value);
      else formData.append(key, String(value));
    }
  });
  const res = await api.post<ApiResponse<School>>("/super-admin/schools", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data!;
}

async function updateSchool(id: string, data: Partial<School>): Promise<School | undefined> {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) formData.append(key, value);
      else formData.append(key, String(value));
    }
  });
  const res = await api.put<ApiResponse<School>>(`/super-admin/schools/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

async function deleteSchool(id: string): Promise<boolean> {
  const res = await api.delete<ApiResponse<void>>(`/super-admin/schools/${id}`);
  return res.data.success;
}

async function getUsers(params?: { search?: string; role?: string; schoolId?: string; status?: string }): Promise<User[]> {
  const res = await api.get<ApiResponse<User[]>>('/super-admin/users', { params });
  return res.data.data || [];
}

async function getSubscriptions(): Promise<any[]> {
  const res = await api.get<ApiResponse<any[]>>("/super-admin/subscriptions");
  return res.data.data || [];
}

async function getAnalytics(): Promise<any> {
  const res = await api.get<ApiResponse<any>>("/super-admin/analytics");
  return res.data.data || {};
}

/* ── Advertisements ── */

async function getAdvertisements(): Promise<Advertisement[]> {
  const res = await api.get<ApiResponse<Advertisement[]>>("/super-admin/advertisements");
  return res.data.data || [];
}

async function createAdvertisement(data: Partial<Advertisement>): Promise<Advertisement> {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) formData.append(key, value);
      else if (Array.isArray(value)) formData.append(key, JSON.stringify(value));
      else formData.append(key, String(value));
    }
  });
  const res = await api.post<ApiResponse<Advertisement>>("/super-admin/advertisements", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data!;
}

async function updateAdvertisement(id: string, data: Partial<Advertisement>): Promise<Advertisement | undefined> {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) formData.append(key, value);
      else if (Array.isArray(value)) formData.append(key, JSON.stringify(value));
      else formData.append(key, String(value));
    }
  });
  const res = await api.put<ApiResponse<Advertisement>>(`/super-admin/advertisements/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

async function deleteAdvertisement(id: string): Promise<boolean> {
  const res = await api.delete<ApiResponse<void>>(`/super-admin/advertisements/${id}`);
  return res.data.success;
}

/* ── Principal ── */

async function getPrincipalStats(): Promise<any> {
  const res = await api.get<ApiResponse<any>>("/principal/dashboard");
  return res.data.data || {};
}

async function getAdmins(): Promise<User[]> {
  const res = await api.get<ApiResponse<User[]>>("/principal/admins");
  return res.data.data || [];
}

async function getPerformance(): Promise<any> {
  const res = await api.get<ApiResponse<any>>("/principal/performance");
  return res.data.data || {};
}

/* ── Admin (School Admin) ── */

async function getAdminStats(): Promise<any> {
  const res = await api.get<ApiResponse<any>>("/admin/dashboard");
  return res.data.data || {};
}

/* ── Teachers ── */

async function getTeachers(params?: { search?: string; status?: string }): Promise<Teacher[]> {
  const res = await api.get<ApiResponse<Teacher[]>>('/admin/teachers', { params });
  return res.data.data || [];
}

async function createTeacher(data: Partial<Teacher>): Promise<Teacher> {
  const res = await api.post<ApiResponse<Teacher>>("/admin/teachers", data);
  return res.data.data!;
}

async function updateTeacher(id: string, data: Partial<Teacher>): Promise<Teacher | undefined> {
  const res = await api.put<ApiResponse<Teacher>>(`/admin/teachers/${id}`, data);
  return res.data.data;
}

async function deleteTeacher(id: string): Promise<boolean> {
  const res = await api.delete<ApiResponse<void>>(`/admin/teachers/${id}`);
  return res.data.success;
}

/* ── Students ── */

async function getStudents(params?: { search?: string; class?: string; section?: string; status?: string }): Promise<Student[]> {
  const res = await api.get<ApiResponse<Student[]>>('/admin/students', { params });
  return res.data.data || [];
}

async function createStudent(data: Partial<Student>): Promise<Student> {
  const res = await api.post<ApiResponse<Student>>("/admin/students", data);
  return res.data.data!;
}

async function updateStudent(id: string, data: Partial<Student>): Promise<Student | undefined> {
  const res = await api.put<ApiResponse<Student>>(`/admin/students/${id}`, data);
  return res.data.data;
}

async function deleteStudent(id: string): Promise<boolean> {
  const res = await api.delete<ApiResponse<void>>(`/admin/students/${id}`);
  return res.data.success;
}

/* ── Parents ── */

async function getParents(params?: { search?: string; status?: string }): Promise<Parent[]> {
  const res = await api.get<ApiResponse<Parent[]>>('/admin/parents', { params });
  return res.data.data || [];
}

async function createParent(data: Partial<Parent>): Promise<Parent> {
  const res = await api.post<ApiResponse<Parent>>("/admin/parents", data);
  return res.data.data!;
}

async function updateParent(id: string, data: Partial<Parent>): Promise<Parent | undefined> {
  const res = await api.put<ApiResponse<Parent>>(`/admin/parents/${id}`, data);
  return res.data.data;
}

async function deleteParent(id: string): Promise<boolean> {
  const res = await api.delete<ApiResponse<void>>(`/admin/parents/${id}`);
  return res.data.success;
}

/* ── Classes & Subjects ── */

async function getClasses(): Promise<Class[]> {
  const res = await api.get<ApiResponse<Class[]>>("/admin/classes");
  return res.data.data || [];
}

async function createClass(data: Partial<Class>): Promise<Class> {
  const res = await api.post<ApiResponse<Class>>("/admin/classes", data);
  return res.data.data!;
}

async function getSubjects(): Promise<Subject[]> {
  const res = await api.get<ApiResponse<Subject[]>>("/admin/subjects");
  return res.data.data || [];
}

/* ── Fee ── */

async function getFeeStructures(): Promise<FeeStructure[]> {
  const res = await api.get<ApiResponse<FeeStructure[]>>("/fee/structures");
  return res.data.data || [];
}

async function createFeeStructure(data: Partial<FeeStructure>): Promise<FeeStructure> {
  const res = await api.post<ApiResponse<FeeStructure>>("/fee/structures", data);
  return res.data.data!;
}

async function getFeeRecords(params?: { studentId?: string; status?: string }): Promise<FeeRecord[]> {
  const res = await api.get<ApiResponse<FeeRecord[]>>('/fee/records', { params });
  return res.data.data || [];
}

/* ── Attendance ── */

async function getAttendance(params?: { date?: string; class?: string; section?: string }): Promise<Attendance[]> {
  const res = await api.get<ApiResponse<Attendance[]>>('/admin/attendance', { params });
  return res.data.data || [];
}

async function saveAttendance(records: Attendance[]): Promise<ApiResponse<void>> {
  const res = await api.post<ApiResponse<void>>("/teacher/attendance", { records });
  return res.data;
}

async function getAttendanceSummary(studentId?: string): Promise<any> {
  const url = studentId ? `/parent/children/${studentId}/attendance/summary` : '/principal/attendance-summary';
  const res = await api.get<ApiResponse<any>>(url);
  return res.data.data || {};
}

/* ── Announcements ── */

async function getAnnouncements(): Promise<Announcement[]> {
  const res = await api.get<ApiResponse<Announcement[]>>("/communication/announcements");
  return res.data.data || [];
}

async function createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
  const res = await api.post<ApiResponse<Announcement>>("/communication/announcements", data);
  return res.data.data!;
}

async function deleteAnnouncement(id: string): Promise<boolean> {
  const res = await api.delete<ApiResponse<void>>(`/communication/announcements/${id}`);
  return res.data.success;
}

/* ── Messages ── */

async function getConversations(): Promise<Conversation[]> {
  const res = await api.get<ApiResponse<Conversation[]>>("/communication/messages/conversations");
  return res.data.data || [];
}

async function getMessages(conversationId?: string): Promise<Message[]> {
  const res = await api.get<ApiResponse<Message[]>>("/communication/messages/conversations/" + (conversationId || "me"));
  return res.data.data || [];
}

async function sendMessage(data: { content: string; receiverId?: string; groupId?: string }): Promise<Message> {
  const res = await api.post<ApiResponse<Message>>("/communication/messages", data);
  return res.data.data!;
}

/* ── Notifications ── */

async function getNotifications(): Promise<Notification[]> {
  const res = await api.get<ApiResponse<Notification[]>>("/communication/notifications");
  return res.data.data || [];
}

async function markNotificationRead(id: string): Promise<ApiResponse<void>> {
  const res = await api.put<ApiResponse<void>>(`/communication/notifications/${id}/read`, {});
  return res.data;
}

async function markAllNotificationsRead(): Promise<ApiResponse<void>> {
  const res = await api.put<ApiResponse<void>>("/communication/notifications/read-all", {});
  return res.data;
}

async function deleteNotification(id: string): Promise<boolean> {
  const res = await api.delete<ApiResponse<void>>(`/communication/notifications/${id}`);
  return res.data.success;
}

/* ── Timetable ── */

async function getTimetable(className?: string, section?: string): Promise<TimetableEntry[]> {
  const params: Record<string, string> = {};
  if (className) params.class = className;
  if (section) params.section = section;
  const res = await api.get<ApiResponse<TimetableEntry[]>>('/admin/timetable', { params });
  return res.data.data || [];
}

/* ── Homework ── */

async function getHomework(): Promise<Homework[]> {
  const res = await api.get<ApiResponse<Homework[]>>("/teacher/homework");
  return res.data.data || [];
}

async function getSubmissions(homeworkId: string): Promise<HomeworkSubmission[]> {
  const res = await api.get<ApiResponse<HomeworkSubmission[]>>(`/teacher/homework/${homeworkId}/submissions`);
  return res.data.data || [];
}

async function submitHomework(homeworkId: string, data: { content?: string; attachment?: File }): Promise<ApiResponse<void>> {
  const formData = new FormData();
  if (data.content) formData.append("content", data.content);
  if (data.attachment) formData.append("attachment", data.attachment);
  const res = await api.post<ApiResponse<void>>(`/student/homework/${homeworkId}/submit`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/* ── Marks ── */

async function getMarks(params?: { className?: string; section?: string; subject?: string; examType?: string }): Promise<Mark[]> {
  const res = await api.get<ApiResponse<Mark[]>>('/teacher/marks', { params });
  return res.data.data || [];
}

async function saveMarks(data: any[]): Promise<ApiResponse<void>> {
  const res = await api.post<ApiResponse<void>>("/teacher/marks", { marks: data });
  return res.data;
}

/* ── Results ── */

async function getResults(studentId?: string): Promise<Result[]> {
  const url = studentId ? `/result/student/${studentId}` : '/student/results';
  const res = await api.get<ApiResponse<Result[]>>(url);
  return res.data.data || [];
}

/* ── Q&A ── */

async function getQAItems(): Promise<any[]> {
  const res = await api.get<ApiResponse<any[]>>("/teacher/qa");
  return res.data.data || [];
}

async function askQuestion(data: { question: string; subject?: string; studentId?: string; studentName?: string }): Promise<ApiResponse<any>> {
  const res = await api.post<ApiResponse<any>>("/student/qa", data);
  return res.data;
}

async function answerQuestion(id: string, answer: string, isPublic: boolean): Promise<ApiResponse<any>> {
  const res = await api.post<ApiResponse<any>>(`/teacher/qa/${id}/answer`, { answer, isPublic });
  return res.data;
}

/* ── Reports ── */

async function getReportRequests(): Promise<ReportRequest[]> {
  const res = await api.get<ApiResponse<ReportRequest[]>>("/teacher/report-requests");
  return res.data.data || [];
}

async function createReportRequest(data: Partial<ReportRequest>): Promise<ReportRequest> {
  const res = await api.post<ApiResponse<ReportRequest>>("/report/requests", data);
  return res.data.data!;
}

/* ── Parent specific ── */

async function getChildren(): Promise<Student[]> {
  const res = await api.get<ApiResponse<Student[]>>("/parent/children");
  return res.data.data || [];
}

async function getChildById(studentId: string): Promise<Student | undefined> {
  const res = await api.get<ApiResponse<Student>>(`/parent/children/${studentId}`);
  return res.data.data;
}

async function getChildAttendance(studentId: string): Promise<Attendance[]> {
  const res = await api.get<ApiResponse<Attendance[]>>(`/parent/children/${studentId}/attendance`);
  return res.data.data || [];
}

async function getChildHomework(studentId: string): Promise<Homework[]> {
  const res = await api.get<ApiResponse<Homework[]>>(`/parent/children/${studentId}/homework`);
  return res.data.data || [];
}

async function getChildResults(studentId: string): Promise<Result[]> {
  const res = await api.get<ApiResponse<Result[]>>(`/parent/children/${studentId}/results`);
  return res.data.data || [];
}

async function getChildMarks(studentId: string): Promise<Mark[]> {
  const res = await api.get<ApiResponse<Mark[]>>(`/parent/children/${studentId}/marks`);
  return res.data.data || [];
}

async function getParentStats(): Promise<any> {
  const res = await api.get<ApiResponse<any>>("/parent/dashboard");
  return res.data.data || {};
}

/* ── Teacher specific ── */

async function getTodayClasses(): Promise<any[]> {
  const res = await api.get<ApiResponse<any[]>>("/teacher/classes");
  return res.data.data || [];
}

async function getTeacherStats(): Promise<any> {
  const res = await api.get<ApiResponse<any>>("/teacher/dashboard");
  return res.data.data || {};
}

/* ── Student specific ── */

async function getCurrentUser(role: string): Promise<User> {
  const res = await api.get<ApiResponse<User>>("/auth/me");
  return res.data.data!;
}

async function getStudentStats(): Promise<any> {
  const res = await api.get<ApiResponse<any>>("/student/dashboard");
  return res.data.data || {};
}

// ───────────────────────────────────────────────────────────────
// mockApi-compatible object (drop-in replacement)
// ───────────────────────────────────────────────────────────────

export const mockApi = {
  // Auth
  login,
  logout,
  getMe,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyOTP,
  setupParentPassword,
  changePassword,
  updateProfile,

  // Consumer Ads
  getConsumerAdvertisements,
  trackAdClick,

  // Settings
  getUserSettings,
  updateUserSettings,

  // Super Admin
  getDashboardStats,
  getSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  deleteSchool,
  getUsers,
  getSubscriptions,
  getAnalytics,

  // Ads
  getAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,

  // Principal
  getPrincipalStats,
  getAdmins,
  getPerformance,

  // Admin
  getAdminStats,

  // Teachers
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,

  // Students
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,

  // Parents
  getParents,
  createParent,
  updateParent,
  deleteParent,

  // Classes & Subjects
  getClasses,
  createClass,
  getSubjects,

  // Fee
  getFeeStructures,
  createFeeStructure,
  getFeeRecords,

  // Attendance
  getAttendance,
  saveAttendance,
  getAttendanceSummary,

  // Announcements
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,

  // Messages
  getConversations,
  getMessages,
  sendMessage,

  // Notifications
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,

  // Timetable
  getTimetable,

  // Homework
  getHomework,
  getSubmissions,
  submitHomework,

  // Marks
  getMarks,
  saveMarks,

  // Results
  getResults,

  // Q&A
  getQAItems,
  askQuestion,
  answerQuestion,

  // Reports
  getReportRequests,
  createReportRequest,

  // Parent specific
  getChildren,
  getChildById,
  getChildAttendance,
  getChildHomework,
  getChildResults,
  getChildMarks,
  getParentStats,

  // Consumer Ads
  getConsumerAdvertisements,
  trackAdClick,

  // Settings
  getUserSettings,
  updateUserSettings,

  // Teacher specific
  getTodayClasses,
  getTeacherStats,

  // Student specific
  getCurrentUser,
  getStudentStats,
};

// ───────────────────────────────────────────────────────────────
// Named exports (for useApi hook and direct imports)
// ───────────────────────────────────────────────────────────────

export function useApi<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

export {
  login,
  logout,
  getMe,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyOTP,
  setupParentPassword,
  changePassword,
  updateProfile,
  getDashboardStats,
  getSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  deleteSchool,
  getUsers,
  getSubscriptions,
  getAnalytics,
  getAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  getPrincipalStats,
  getAdmins,
  getPerformance,
  getAdminStats,
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getParents,
  createParent,
  updateParent,
  deleteParent,
  getClasses,
  createClass,
  getSubjects,
  getFeeStructures,
  createFeeStructure,
  getFeeRecords,
  getAttendance,
  saveAttendance,
  getAttendanceSummary,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getConversations,
  getMessages,
  sendMessage,
  getNotifications,
  markNotificationR  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getTimetable,
  getHomework,
  getSubmissions,
  submitHomework,
  getMarks,
  saveMarks,
  getResults,
  getQAItems,
  askQuestion,
  answerQuestion,
  getReportRequests,
  createReportRequest,
  getChildren,
  getChildById,
  getChildAttendance,
  getChildHomework,
  getChildResults,
  getChildMarks,
  getParentStats,
  getTodayClasses,
  getTeacherStats,
  getCurrentUser,
  getStudentStats,
  getConsumerAdvertisements,
  trackAdClick,
  getUserSettings,
  updateUserSettings,
};
