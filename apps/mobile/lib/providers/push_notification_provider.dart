import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/push_notification_service.dart';
import '../routing/app_navigator.dart';

final pushNotificationServiceProvider = Provider<PushNotificationService>((ref) {
  return PushNotificationService();
});

final pushNotificationHandlerProvider = Provider<void Function(RemoteMessage)>((ref) {
  return _handleNotificationTap;
});

void _handleNotificationTap(RemoteMessage message) {
  final type = message.data['type'];
  final id = message.data['id'];
  switch (type) {
    case 'MESSAGE':
      AppNavigator.goToChat(conversationId: id);
      break;
    case 'HOMEWORK':
      AppNavigator.goToHomework(homeworkId: id);
      break;
    case 'REPORT_READY':
      AppNavigator.goToReports();
      break;
    case 'FEE_DUE':
      AppNavigator.goToFee();
      break;
    case 'ANNOUNCEMENT':
      AppNavigator.goToAnnouncements();
      break;
    default:
      AppNavigator.goToLogin();
  }
}
