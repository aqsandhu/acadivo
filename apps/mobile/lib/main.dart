import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

import 'routing/app_router.dart';
import 'providers/locale_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/auth_provider.dart';
import 'providers/push_notification_provider.dart';
import 'services/push_notification_service.dart';
import 'utils/theme.dart';
import 'utils/constants.dart';
import 'storage/local_storage.dart';
import 'storage/preferences.dart';

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
          child: _OfflineBanner(child: child!),
        );
      },
    );
  }
}

class _OfflineBanner extends ConsumerStatefulWidget {
  final Widget child;
  const _OfflineBanner({required this.child});

  @override
  ConsumerState<_OfflineBanner> createState() => _OfflineBannerState();
}

class _OfflineBannerState extends ConsumerState<_OfflineBanner> {
  bool _isOffline = false;

  @override
  void initState() {
    super.initState();
    Connectivity().onConnectivityChanged.listen((result) {
      setState(() {
        _isOffline = result == ConnectivityResult.none;
      });
    });
    _checkConnectivity();
  }

  Future<void> _checkConnectivity() async {
    final result = await Connectivity().checkConnectivity();
    setState(() {
      _isOffline = result == ConnectivityResult.none;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isUrdu = ref.watch(isRtlProvider);
    return Directionality(
      textDirection: isUrdu ? TextDirection.rtl : TextDirection.ltr,
      child: Column(
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            height: _isOffline ? 32 : 0,
            color: Colors.red,
            child: _isOffline
                ? Center(
                    child: Text(
                      isUrdu ? 'آف لائن - کوئی انٹرنیٹ کنکشن نہیں' : 'OFFLINE - No Internet Connection',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  )
                : null,
          ),
          Expanded(child: widget.child),
        ],
      ),
    );
  }
}
