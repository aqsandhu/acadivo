// lib/routing/app_navigator.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'route_names.dart';

class AppNavigator {
  const AppNavigator._();

  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  static BuildContext? get _context => navigatorKey.currentContext;

  static void _safeGo(String route) {
    final ctx = _context;
    if (ctx != null && ctx.mounted) ctx.go(route);
  }

  static void _safePush(String route) {
    final ctx = _context;
    if (ctx != null && ctx.mounted) ctx.push(route);
  }

  static void goToSplash() => _safeGo(RouteNames.splash);
  static void goToLogin() => _safeGo(RouteNames.login);
  static void goToForgotPassword() => _safePush(RouteNames.forgotPassword);
  static void goToResetPassword({String? token}) =>
      _safePush('${RouteNames.resetPassword}?token=$token');
  static void goToSetupParentPassword() => _safePush(RouteNames.setupParentPassword);

  static void goToTeacherDashboard() => _safeGo(RouteNames.teacherDashboard);
  static void goToStudentDashboard() => _safeGo(RouteNames.studentDashboard);
  static void goToParentDashboard() => _safeGo(RouteNames.parentDashboard);
  static void goToAdminDashboard() => _safeGo(RouteNames.adminDashboard);
  static void goToPrincipalDashboard() => _safeGo(RouteNames.principalDashboard);
  static void goToSuperAdminDashboard() => _safeGo(RouteNames.superAdminDashboard);

  static void goToChat({required String conversationId}) =>
      _safePush('/messages/$conversationId');
  static void goToHomework({required String homeworkId}) =>
      _safePush('${RouteNames.teacherHomework}/$homeworkId');
  static void goToReports() => _safePush(RouteNames.teacherReports);
  static void goToFee() => _safePush(RouteNames.parentFee);
  static void goToAnnouncements() => _safePush(RouteNames.adminAnnouncements);

  static void goToNotifications() => _safePush(RouteNames.notifications);
  static void goToSettings() => _safePush(RouteNames.settings);
  static void goToProfile() => _safePush(RouteNames.profile);

  static void pop() {
    final ctx = _context;
    if (ctx != null && ctx.mounted) ctx.pop();
  }

  static void popUntilRoot() => _safeGo(RouteNames.login);
  static void replaceWithLogin() => _safeGo(RouteNames.login);

  // Context-based helpers for use inside widgets
  static void goToSplashWithContext(BuildContext context) => context.go(RouteNames.splash);
  static void goToLoginWithContext(BuildContext context) => context.go(RouteNames.login);
  static void goToForgotPasswordWithContext(BuildContext context) => context.push(RouteNames.forgotPassword);
  static void goToResetPasswordWithContext(BuildContext context, {String? token}) =>
      context.push('${RouteNames.resetPassword}?token=$token');
  static void goToSetupParentPasswordWithContext(BuildContext context) => context.push(RouteNames.setupParentPassword);
  static void goToTeacherDashboardWithContext(BuildContext context) => context.go(RouteNames.teacherDashboard);
  static void goToStudentDashboardWithContext(BuildContext context) => context.go(RouteNames.studentDashboard);
  static void goToParentDashboardWithContext(BuildContext context) => context.go(RouteNames.parentDashboard);
  static void goToAdminDashboardWithContext(BuildContext context) => context.go(RouteNames.adminDashboard);
  static void goToPrincipalDashboardWithContext(BuildContext context) => context.go(RouteNames.principalDashboard);
  static void goToSuperAdminDashboardWithContext(BuildContext context) => context.go(RouteNames.superAdminDashboard);
  static void goToChatWithContext(BuildContext context, {required String conversationId}) =>
      context.push('/messages/$conversationId');
  static void goToNotificationsWithContext(BuildContext context) => context.push(RouteNames.notifications);
  static void goToSettingsWithContext(BuildContext context) => context.push(RouteNames.settings);
  static void goToProfileWithContext(BuildContext context) => context.push(RouteNames.profile);
  static void popWithContext(BuildContext context) => context.pop();
  static void popUntilRootWithContext(BuildContext context) => context.go(RouteNames.login);
  static void replaceWithLoginWithContext(BuildContext context) => context.go(RouteNames.login);
}
