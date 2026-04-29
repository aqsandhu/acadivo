import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'routing/app_router.dart';
import 'providers/locale_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/auth_provider.dart';
import 'services/push_notification_service.dart';
import 'utils/theme.dart';
import 'utils/constants.dart';
import 'storage/local_storage.dart';
import 'storage/preferences.dart';
import 'splash.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load environment variables
  await dotenv.load(fileName: '.env');

  // Firebase initialization
  await Firebase.initializeApp();

  // Hive initialization
  await Hive.initFlutter();
  await LocalStorage.init();

  // SharedPreferences initialization
  await Preferences.init();

  // System UI configuration
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  // Initialize push notifications
  final pushNotificationService = PushNotificationService();
  await pushNotificationService.initialize();

  runApp(
    ProviderScope(
      overrides: [
        pushNotificationServiceProvider.overrideWithValue(pushNotificationService),
      ],
      child: const AcadivoApp(),
    ),
  );
}

class AcadivoApp extends ConsumerWidget {
  const AcadivoApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    final themeMode = ref.watch(themeProvider);
    final locale = ref.watch(localeProvider);

    return MaterialApp.router(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      locale: locale,
      supportedLocales: AppConstants.supportedLocales,
      localizationsDelegates: AppConstants.localizationsDelegates,
      routerConfig: router,
      builder: (context, child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(
            textScaler: const TextScaler.linear(1.0),
          ),
          child: child!,
        );
      },
    );
  }
}
