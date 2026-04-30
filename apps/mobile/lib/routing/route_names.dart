class RouteNames {
  // Auth
  static const String login = '/login';
  static const String forgotPassword = '/forgot-password';
  static const String resetPassword = '/reset-password';

  // Admin
  static const String adminDashboard = '/admin/dashboard';
  static const String adminStudents = '/admin/students';
  static const String adminTeachers = '/admin/teachers';
  static const String adminParents = '/admin/parents';
  static const String adminClasses = '/admin/classes';
  static const String adminSubjects = '/admin/subjects';
  static const String adminTimetable = '/admin/timetable';
  static const String adminAttendance = '/admin/attendance';
  static const String adminFee = '/admin/fee';
  static const String adminAnnouncements = '/admin/announcements';
  static const String adminSettings = '/admin/settings';

  // Principal
  static const String principalDashboard = '/principal/dashboard';
  static const String principalTeachers = '/principal/teachers';
  static const String principalStudents = '/principal/students';
  static const String principalParents = '/principal/parents';
  static const String principalAttendance = '/principal/attendance';
  static const String principalFee = '/principal/fee';
  static const String principalMessages = '/principal/messages';
  static const String principalAnnouncements = '/principal/announcements';
  static const String principalNotifications = '/principal/notifications';
  static const String principalReports = '/principal/reports';

  // Teacher
  static const String teacherDashboard = '/teacher/dashboard';
  static const String teacherClasses = '/teacher/classes';
  static const String teacherAttendance = '/teacher/attendance';
  static const String teacherHomework = '/teacher/homework';
  static const String teacherMarks = '/teacher/marks';
  static const String teacherMessages = '/teacher/messages';
  static const String teacherQa = '/teacher/qa';
  static const String teacherReports = '/teacher/reports';
  static const String teacherTimetable = '/teacher/timetable';
  static const String teacherNotifications = '/teacher/notifications';
  static const String teacherProfile = '/teacher/profile';

  // Student
  static const String studentDashboard = '/student/dashboard';
  static const String studentAttendance = '/student/attendance';
  static const String studentHomework = '/student/homework';
  static const String studentMarks = '/student/marks';
  static const String studentMessages = '/student/messages';
  static const String studentQa = '/student/qa';
  static const String studentResults = '/student/results';
  static const String studentTimetable = '/student/timetable';
  static const String studentNotifications = '/student/notifications';

  // Parent
  static const String parentDashboard = '/parent/dashboard';
  static const String parentChildren = '/parent/children';
  static const String parentChildDetail = '/parent/child/:id';
  static const String parentAttendance = '/parent/attendance';
  static const String parentFee = '/parent/fee';
  static const String parentHomework = '/parent/homework';
  static const String parentMessages = '/parent/messages';
  static const String parentQa = '/parent/qa';
  static const String parentReports = '/parent/reports';
  static const String parentResults = '/parent/results';
  static const String parentNotifications = '/parent/notifications';

  // Common
  static const String notifications = '/notifications';
  static const String profile = '/profile';
  static const String settings = '/settings';
  static const String chat = '/messages/:userId';

  // Super Admin
  static const String superAdminDashboard = '/super-admin/dashboard';
  static const String superAdminSchools = '/super-admin/schools';
  static const String superAdminUsers = '/super-admin/users';
  static const String superAdminSubscriptions = '/super-admin/subscriptions';
  static const String superAdminAdvertisements = '/super-admin/advertisements';
  static const String superAdminAnalytics = '/super-admin/analytics';
}
