// lib/routing/app_navigator.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'route_names.dart';

class AppNavigator {
  const AppNavigator._();

  static void goToSplash(BuildContext context) => context.go(RouteNames.splash);
  static void goToLogin(BuildContext context) => context.go(RouteNames.login);
  static void goToForgotPassword(BuildContext context) => context.push(RouteNames.forgotPassword);
  static void goToResetPassword(BuildContext context, {String? token}) =>
      context.push('${RouteNames.resetPassword}?token=$token');
  static void goToSetupParentPassword(BuildContext context) => context.push(RouteNames.setupParentPassword);

  static void goToDashboard(BuildContext context) => context.go(RouteNames.dashboard);
  static void goToTeacherDashboard(BuildContext context) => context.go(RouteNames.teacherDashboard);
  static void goToStudentDashboard(BuildContext context) => context.go(RouteNames.studentDashboard);
  static void goToParentDashboard(BuildContext context) => context.go(RouteNames.parentDashboard);
  static void goToAdminDashboard(BuildContext context) => context.go(RouteNames.adminDashboard);
  static void goToPrincipalDashboard(BuildContext context) => context.go(RouteNames.principalDashboard);
  static void goToSuperAdminDashboard(BuildContext context) => context.go(RouteNames.superAdminDashboard);

  static void goToChat(BuildContext context, String userId) =>
      context.push('/messages/$userId');
  static void goToNotifications(BuildContext context) => context.push(RouteNames.notifications);
  static void goToSettings(BuildContext context) => context.push(RouteNames.settings);
  static void goToProfile(BuildContext context) => context.push(RouteNames.profile);

  static void pop(BuildContext context) => context.pop();
  static void popUntilRoot(BuildContext context) => context.go(RouteNames.splash);

  static void replaceWithLogin(BuildContext context) =>
      context.go(RouteNames.login);
  static void replaceWithDashboard(BuildContext context) =>
      context.go(RouteNames.dashboard);
}
