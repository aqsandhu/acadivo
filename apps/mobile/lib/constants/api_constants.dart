// lib/constants/api_constants.dart
class ApiConstants {
  ApiConstants._();

  // Base URL from environment
  static String get baseUrl => const String.fromEnvironment('API_BASE_URL',
      defaultValue: 'https://api.acadivo.com/v1');

  static String get socketUrl => const String.fromEnvironment('SOCKET_URL',
      defaultValue: 'https://api.acadivo.com');

  // Auth endpoints
  static const String login = '/auth/login';
  static const String refreshToken = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String verifyOtp = '/auth/verify-otp';
  static const String setupParentPassword = '/auth/setup-parent-password';
  static const String updateProfile = '/auth/profile';
  static const String changePassword = '/auth/change-password';
  static const String registerFcmToken = '/auth/fcm-token';

  // Dashboard
  static const String dashboard = '/dashboard';

  // Teacher
  static const String teachers = '/teachers';
  static const String teacherClasses = '/teachers/classes';
  static const String teacherSubjects = '/teachers/subjects';
  static const String teacherAttendance = '/teachers/attendance';
  static const String teacherHomework = '/teachers/homework';
  static const String teacherMarks = '/teachers/marks';

  // Student
  static const String students = '/students';
  static const String studentAttendance = '/students/attendance';
  static const String studentHomework = '/students/homework';
  static const String studentResults = '/students/results';
  static const String studentTimetable = '/students/timetable';

  // Parent
  static const String parents = '/parents';
  static const String parentChildren = '/parents/children';
  static const String parentFee = '/parents/fee';
  static const String parentReports = '/parents/reports';

  // Admin
  static const String adminUsers = '/admin/users';
  static const String adminClasses = '/admin/classes';
  static const String adminSections = '/admin/sections';
  static const String adminSubjects = '/admin/subjects';
  static const String adminAttendance = '/admin/attendance';
  static const String adminFee = '/admin/fee';
  static const String adminResults = '/admin/results';
  static const String adminAnnouncements = '/admin/announcements';
  static const String adminReports = '/admin/reports';

  // Principal
  static const String principalDashboard = '/principal/dashboard';
  static const String principalTeachers = '/principal/teachers';
  static const String principalStudents = '/principal/students';
  static const String principalAttendance = '/principal/attendance';
  static const String principalFee = '/principal/fee';
  static const String principalResults = '/principal/results';

  // Super Admin
  static const String superAdminSchools = '/super-admin/schools';
  static const String superAdminUsers = '/super-admin/users';
  static const String superAdminSubscriptions = '/super-admin/subscriptions';
  static const String superAdminAdvertisements = '/super-admin/advertisements';
  static const String superAdminAnalytics = '/super-admin/analytics';

  // Communication
  static const String messages = '/messages';
  static const String conversations = '/messages/conversations';
  static const String notifications = '/notifications';
  static const String announcements = '/announcements';

  // Fee
  static const String feeStructures = '/fee/structures';
  static const String feeRecords = '/fee/records';
  static const String feeCollect = '/fee/collect';

  // Results
  static const String results = '/results';
  static const String marks = '/marks';
  static const String examTypes = '/results/exam-types';
}
