// lib/routing/route_names.dart
class RouteNames {
  RouteNames._();

  // Auth
  static const String splash = '/';
  static const String login = '/login';
  static const String forgotPassword = '/forgot-password';
  static const String resetPassword = '/reset-password';
  static const String setupParentPassword = '/setup-parent-password';

  // Dashboard
  static const String dashboard = '/dashboard';

  // Teacher
  static const String teacher = '/teacher';
  static const String teacherDashboard = '/teacher/dashboard';
  static const String teacherAttendance = '/teacher/attendance';
  static const String teacherHomework = '/teacher/homework';
  static const String teacherMarks = '/teacher/marks';
  static const String teacherTimetable = '/teacher/timetable';
  static const String teacherStudents = '/teacher/students';

  // Student
  static const String student = '/student';
  static const String studentDashboard = '/student/dashboard';
  static const String studentAttendance = '/student/attendance';
  static const String studentHomework = '/student/homework';
  static const String studentResults = '/student/results';
  static const String studentTimetable = '/student/timetable';

  // Parent
  static const String parent = '/parent';
  static const String parentDashboard = '/parent/dashboard';
  static const String parentChildren = '/parent/children';
  static const String parentAttendance = '/parent/attendance';
  static const String parentHomework = '/parent/homework';
  static const String parentResults = '/parent/results';
  static const String parentFee = '/parent/fee';
  static const String parentReports = '/parent/reports';

  // Admin
  static const String admin = '/admin';
  static const String adminDashboard = '/admin/dashboard';
  static const String adminUsers = '/admin/users';
  static const String adminClasses = '/admin/classes';
  static const String adminSections = '/admin/sections';
  static const String adminSubjects = '/admin/subjects';
  static const String adminStudents = '/admin/students';
  static const String adminTeachers = '/admin/teachers';
  static const String adminFee = '/admin/fee';
  static const String adminAnnouncements = '/admin/announcements';
  static const String adminAttendance = '/admin/attendance';

  // Principal
  static const String principal = '/principal';
  static const String principalDashboard = '/principal/dashboard';
  static const String principalTeachers = '/principal/teachers';
  static const String principalStudents = '/principal/students';
  static const String principalAttendance = '/principal/attendance';
  static const String principalFee = '/principal/fee';
  static const String principalResults = '/principal/results';

  // Super Admin
  static const String superAdmin = '/super-admin';
  static const String superAdminDashboard = '/super-admin/dashboard';
  static const String superAdminSchools = '/super-admin/schools';
  static const String superAdminUsers = '/super-admin/users';
  static const String superAdminSubscriptions = '/super-admin/subscriptions';
  static const String superAdminAdvertisements = '/super-admin/advertisements';
  static const String superAdminAnalytics = '/super-admin/analytics';

  // Shared
  static const String messages = '/messages';
  static const String chat = '/messages/:userId';
  static const String notifications = '/notifications';
  static const String announcements = '/announcements';
  static const String settings = '/settings';
  static const String profile = '/profile';
  static const String changePassword = '/change-password';
}
