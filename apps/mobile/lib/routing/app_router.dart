import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod/riverpod.dart';

import '../screens/screens.dart';
import '../providers/auth_provider.dart';
import '../models/user_model.dart';
import 'route_names.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: RouteNames.login,
    redirect: (context, state) {
      // Auth state is now available here through Riverpod context
      // But for simplicity, we'll check through authState
      final isLoggedIn = authState.isAuthenticated;
      final isAuthRoute = state.matchedLocation == RouteNames.login ||
          state.matchedLocation == RouteNames.forgotPassword ||
          state.matchedLocation == RouteNames.resetPassword;

      if (!isLoggedIn && !isAuthRoute) {
        return RouteNames.login;
      }

      if (isLoggedIn && isAuthRoute) {
        // Redirect to role-specific dashboard
        return authState.redirectRoute ?? RouteNames.studentDashboard;
      }

      return null;
    },
    routes: [
      // Auth Routes
      GoRoute(
        path: RouteNames.login,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: RouteNames.forgotPassword,
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: RouteNames.resetPassword,
        builder: (context, state) {
          final token = state.uri.queryParameters['token'];
          return ResetPasswordScreen(token: token);
        },
      ),
      GoRoute(
        path: RouteNames.setupParentPassword,
        builder: (context, state) => const SetupParentPasswordScreen(),
      ),

      // Admin Routes
      GoRoute(
        path: RouteNames.adminDashboard,
        builder: (context, state) => const AdminDashboardScreen(),
      ),
      GoRoute(
        path: RouteNames.adminStudents,
        builder: (context, state) => const ManageStudentsScreen(),
      ),
      GoRoute(
        path: RouteNames.adminTeachers,
        builder: (context, state) => const ManageTeachersScreen(),
      ),
      GoRoute(
        path: RouteNames.adminParents,
        builder: (context, state) => const ManageParentsScreen(),
      ),
      GoRoute(
        path: RouteNames.adminClasses,
        builder: (context, state) => const ManageClassesScreen(),
      ),
      GoRoute(
        path: RouteNames.adminSubjects,
        builder: (context, state) => const ManageSubjectsScreen(),
      ),
      GoRoute(
        path: RouteNames.adminTimetable,
        builder: (context, state) => const TimetableBuilderScreen(),
      ),
      GoRoute(
        path: RouteNames.adminAttendance,
        builder: (context, state) => const AdminAttendanceScreen(),
      ),
      GoRoute(
        path: RouteNames.adminFee,
        builder: (context, state) => const FeeManagementScreen(),
      ),
      GoRoute(
        path: RouteNames.adminAnnouncements,
        builder: (context, state) => const SchoolAnnouncementsScreen(),
      ),
      GoRoute(
        path: RouteNames.adminSettings,
        builder: (context, state) => const SchoolSettingsScreen(),
      ),

      // Principal Routes
      GoRoute(
        path: RouteNames.principalDashboard,
        builder: (context, state) => const PrincipalDashboardScreen(),
      ),
      GoRoute(
        path: RouteNames.principalTeachers,
        builder: (context, state) => const SchoolTeachersScreen(),
      ),
      GoRoute(
        path: RouteNames.principalStudents,
        builder: (context, state) => const SchoolStudentsScreen(),
      ),
      GoRoute(
        path: RouteNames.principalParents,
        builder: (context, state) => const SchoolParentsScreen(),
      ),
      GoRoute(
        path: RouteNames.principalAttendance,
        builder: (context, state) => const SchoolAttendanceScreen(),
      ),
      GoRoute(
        path: RouteNames.principalFee,
        builder: (context, state) => const SchoolFeeScreen(),
      ),
      GoRoute(
        path: RouteNames.principalMessages,
        builder: (context, state) => const PrincipalMessagesScreen(),
      ),
      GoRoute(
        path: RouteNames.principalAnnouncements,
        builder: (context, state) => const PrincipalAnnouncementsScreen(),
      ),
      GoRoute(
        path: RouteNames.principalNotifications,
        builder: (context, state) => const PrincipalNotificationsScreen(),
      ),
      GoRoute(
        path: RouteNames.principalReports,
        builder: (context, state) => const SchoolReportsScreen(),
      ),

      // Teacher Routes
      GoRoute(
        path: RouteNames.teacherDashboard,
        builder: (context, state) => const TeacherDashboardScreen(),
      ),
      GoRoute(
        path: RouteNames.teacherClasses,
        builder: (context, state) => const TeacherClassesScreen(),
      ),
      GoRoute(
        path: RouteNames.teacherAttendance,
        builder: (context, state) => const MarkAttendanceScreen(),
      ),
      GoRoute(
        path: RouteNames.teacherHomework,
        builder: (context, state) => const TeacherHomeworkScreen(),
      ),
      GoRoute(
        path: RouteNames.teacherHomework + '/create',
        builder: (context, state) => const CreateHomeworkScreen(),
      ),
      GoRoute(
        path: RouteNames.teacherMarks,
        builder: (context, state) => const TeacherMarksScreen(),
      ),
      GoRoute(
        path: RouteNames.teacherMarks + '/grade',
        builder: (context, state) => const GradeSubmissionScreen(),
      ),
      GoRoute(
        path: RouteNames.teacherMessages,
        builder: (context, state) => const TeacherMessagesScreen(),
      ),
      GoRoute(
        path: RouteNames.teacherQa,
        builder: (context, state) => const TeacherQaScreen(),
      ),
      GoRoute(
        path: RouteNames.teacherReports,
        builder: (context, state) => const TeacherReportsScreen(),
      ),
      GoRoute(
        path: RouteNames.teacherTimetable,
        builder: (context, state) => const TeacherTimetableScreen(),
      ),
      GoRoute(
        path: RouteNames.teacherNotifications,
        builder: (context, state) => const TeacherNotificationsScreen(),
      ),
      GoRoute(
        path: RouteNames.teacherProfile,
        builder: (context, state) => const TeacherProfileScreen(),
      ),

      // Student Routes
      GoRoute(
        path: RouteNames.studentDashboard,
        builder: (context, state) => const StudentDashboardScreen(),
      ),
      GoRoute(
        path: RouteNames.studentAttendance,
        builder: (context, state) => const StudentAttendanceScreen(),
      ),
      GoRoute(
        path: RouteNames.studentHomework,
        builder: (context, state) => const StudentHomeworkScreen(),
      ),
      GoRoute(
        path: RouteNames.studentMarks,
        builder: (context, state) => const StudentMarksScreen(),
      ),
      GoRoute(
        path: RouteNames.studentMessages,
        builder: (context, state) => const StudentMessagesScreen(),
      ),
      GoRoute(
        path: RouteNames.studentQa,
        builder: (context, state) => const StudentQaScreen(),
      ),
      GoRoute(
        path: RouteNames.studentResults,
        builder: (context, state) => const StudentResultsScreen(),
      ),
      GoRoute(
        path: RouteNames.studentTimetable,
        builder: (context, state) => const StudentTimetableScreen(),
      ),
      GoRoute(
        path: RouteNames.studentNotifications,
        builder: (context, state) => const StudentNotificationsScreen(),
      ),

      // Parent Routes
      GoRoute(
        path: RouteNames.parentDashboard,
        builder: (context, state) => const ParentDashboardScreen(),
      ),
      GoRoute(
        path: RouteNames.parentChildren,
        builder: (context, state) => const ParentChildrenScreen(),
      ),
      GoRoute(
        path: '/parent/child/:id',
        builder: (context, state) {
          final childId = state.pathParameters['id'] ?? '';
          return ChildDetailScreen(childId: childId);
        },
      ),
      GoRoute(
        path: RouteNames.parentAttendance,
        builder: (context, state) => const ParentAttendanceScreen(),
      ),
      GoRoute(
        path: RouteNames.parentFee,
        builder: (context, state) => const ParentFeeScreen(),
      ),
      GoRoute(
        path: RouteNames.parentHomework,
        builder: (context, state) => const ParentHomeworkScreen(),
      ),
      GoRoute(
        path: RouteNames.parentMessages,
        builder: (context, state) => const ParentMessagesScreen(),
      ),
      GoRoute(
        path: RouteNames.parentQa,
        builder: (context, state) => const ParentQaScreen(),
      ),
      GoRoute(
        path: RouteNames.parentReports,
        builder: (context, state) => const ParentReportsScreen(),
      ),
      GoRoute(
        path: RouteNames.parentResults,
        builder: (context, state) => const ParentResultsScreen(),
      ),
      GoRoute(
        path: RouteNames.parentNotifications,
        builder: (context, state) => const ParentNotificationsScreen(),
      ),

      // Common Routes
      GoRoute(
        path: RouteNames.notifications,
        builder: (context, state) => const NotificationsScreen(),
      ),
      GoRoute(
        path: RouteNames.profile,
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: RouteNames.settings,
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: '/messages/:userId',
        builder: (context, state) {
          final userId = state.pathParameters['userId'] ?? '';
          return ChatScreen(userId: userId);
        },
      ),

      // Super Admin Routes
      GoRoute(
        path: RouteNames.superAdminDashboard,
        builder: (context, state) => const SuperAdminDashboardScreen(),
      ),
      GoRoute(
        path: RouteNames.superAdminSchools,
        builder: (context, state) => const ManageSchoolsScreen(),
      ),
      GoRoute(
        path: RouteNames.superAdminUsers,
        builder: (context, state) => const PlatformUsersScreen(),
      ),
      GoRoute(
        path: RouteNames.superAdminSubscriptions,
        builder: (context, state) => const SubscriptionsScreen(),
      ),
      GoRoute(
        path: RouteNames.superAdminAdvertisements,
        builder: (context, state) => const ManageAdsScreen(),
      ),
      GoRoute(
        path: RouteNames.superAdminAnalytics,
        builder: (context, state) => const PlatformAnalyticsScreen(),
      ),
    ],
  );
});
