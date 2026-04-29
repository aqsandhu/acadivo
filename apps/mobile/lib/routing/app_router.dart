// lib/routing/app_router.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../models/user_model.dart';
import '../providers/auth_provider.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/forgot_password_screen.dart';
import '../screens/auth/reset_password_screen.dart';
import '../screens/auth/setup_parent_password_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/chat/chat_screen.dart';
import '../screens/shared/notifications_screen.dart';
import '../screens/shared/settings_screen.dart';
import '../screens/shared/profile_screen.dart';
import '../splash.dart';
import 'route_names.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: RouteNames.splash,
    debugLogDiagnostics: false,
    redirect: (context, state) {
      final isAuthenticated = authState.isAuthenticated;
      final isLoading = authState.isLoading;
      final location = state.matchedLocation;

      // Don't redirect while loading
      if (isLoading) return null;

      // Allow splash screen
      if (location == RouteNames.splash) return null;

      // Allow auth routes
      final isAuthRoute = location == RouteNames.login ||
          location == RouteNames.forgotPassword ||
          location == RouteNames.resetPassword ||
          location == RouteNames.setupParentPassword;

      if (!isAuthenticated) {
        return isAuthRoute ? null : RouteNames.login;
      }

      // Redirect authenticated users away from auth routes
      if (isAuthenticated && isAuthRoute) {
        return _getRoleBasedRoute(authState.user!.role);
      }

      return null;
    },
    routes: [
      // Splash
      GoRoute(
        path: RouteNames.splash,
        builder: (context, state) => const SplashScreen(),
      ),

      // Auth routes
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

      // Dashboard - role-based
      GoRoute(
        path: RouteNames.dashboard,
        builder: (context, state) => const DashboardScreen(),
      ),

      // Teacher routes
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => child,
        routes: [
          GoRoute(
            path: RouteNames.teacherDashboard,
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: RouteNames.teacherAttendance,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Teacher Attendance')),
            ),
          ),
          GoRoute(
            path: RouteNames.teacherHomework,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Teacher Homework')),
            ),
          ),
          GoRoute(
            path: RouteNames.teacherMarks,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Teacher Marks')),
            ),
          ),
          GoRoute(
            path: RouteNames.teacherTimetable,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Teacher Timetable')),
            ),
          ),
        ],
      ),

      // Student routes
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => child,
        routes: [
          GoRoute(
            path: RouteNames.studentDashboard,
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: RouteNames.studentAttendance,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Student Attendance')),
            ),
          ),
          GoRoute(
            path: RouteNames.studentHomework,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Student Homework')),
            ),
          ),
          GoRoute(
            path: RouteNames.studentResults,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Student Results')),
            ),
          ),
          GoRoute(
            path: RouteNames.studentTimetable,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Student Timetable')),
            ),
          ),
        ],
      ),

      // Parent routes
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => child,
        routes: [
          GoRoute(
            path: RouteNames.parentDashboard,
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: RouteNames.parentChildren,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Parent Children')),
            ),
          ),
          GoRoute(
            path: RouteNames.parentAttendance,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Parent Attendance')),
            ),
          ),
          GoRoute(
            path: RouteNames.parentHomework,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Parent Homework')),
            ),
          ),
          GoRoute(
            path: RouteNames.parentResults,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Parent Results')),
            ),
          ),
          GoRoute(
            path: RouteNames.parentFee,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Parent Fee')),
            ),
          ),
          GoRoute(
            path: RouteNames.parentReports,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Parent Reports')),
            ),
          ),
        ],
      ),

      // Admin routes
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => child,
        routes: [
          GoRoute(
            path: RouteNames.adminDashboard,
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: RouteNames.adminUsers,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Admin Users')),
            ),
          ),
          GoRoute(
            path: RouteNames.adminClasses,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Admin Classes')),
            ),
          ),
          GoRoute(
            path: RouteNames.adminStudents,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Admin Students')),
            ),
          ),
          GoRoute(
            path: RouteNames.adminTeachers,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Admin Teachers')),
            ),
          ),
          GoRoute(
            path: RouteNames.adminFee,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Admin Fee')),
            ),
          ),
          GoRoute(
            path: RouteNames.adminAnnouncements,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Admin Announcements')),
            ),
          ),
        ],
      ),

      // Principal routes
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => child,
        routes: [
          GoRoute(
            path: RouteNames.principalDashboard,
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: RouteNames.principalTeachers,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Principal Teachers')),
            ),
          ),
          GoRoute(
            path: RouteNames.principalStudents,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Principal Students')),
            ),
          ),
          GoRoute(
            path: RouteNames.principalAttendance,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Principal Attendance')),
            ),
          ),
          GoRoute(
            path: RouteNames.principalFee,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Principal Fee')),
            ),
          ),
          GoRoute(
            path: RouteNames.principalResults,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Principal Results')),
            ),
          ),
        ],
      ),

      // Super Admin routes
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => child,
        routes: [
          GoRoute(
            path: RouteNames.superAdminDashboard,
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: RouteNames.superAdminSchools,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Super Admin Schools')),
            ),
          ),
          GoRoute(
            path: RouteNames.superAdminUsers,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Super Admin Users')),
            ),
          ),
          GoRoute(
            path: RouteNames.superAdminSubscriptions,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Super Admin Subscriptions')),
            ),
          ),
          GoRoute(
            path: RouteNames.superAdminAdvertisements,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Super Admin Ads')),
            ),
          ),
          GoRoute(
            path: RouteNames.superAdminAnalytics,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Super Admin Analytics')),
            ),
          ),
        ],
      ),

      // Shared routes
      GoRoute(
        path: RouteNames.chat,
        builder: (context, state) {
          final userId = state.pathParameters['userId'];
          return ChatScreen(userId: userId ?? '');
        },
      ),
      GoRoute(
        path: RouteNames.notifications,
        builder: (context, state) => const NotificationsScreen(),
      ),
      GoRoute(
        path: RouteNames.settings,
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: RouteNames.profile,
        builder: (context, state) => const ProfileScreen(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Route not found: ${state.matchedLocation}'),
      ),
    ),
  );
});

String _getRoleBasedRoute(UserRole role) {
  switch (role) {
    case UserRole.teacher:
      return RouteNames.teacherDashboard;
    case UserRole.student:
      return RouteNames.studentDashboard;
    case UserRole.parent:
      return RouteNames.parentDashboard;
    case UserRole.schoolAdmin:
      return RouteNames.adminDashboard;
    case UserRole.principal:
      return RouteNames.principalDashboard;
    case UserRole.superAdmin:
      return RouteNames.superAdminDashboard;
    default:
      return RouteNames.dashboard;
  }
}
