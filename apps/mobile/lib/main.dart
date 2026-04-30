// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'routing/app_router.dart';
import 'routing/app_navigator.dart';
import 'providers/locale_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/auth_provider.dart';
import 'providers/socket_provider.dart';
import 'providers/connection_provider.dart';
import 'services/push_notification_service.dart';
import 'utils/theme.dart';
import 'utils/constants.dart';
import 'storage/local_storage.dart';
import 'storage/preferences.dart';
import 'widgets/error_boundary_widget.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');

  // Initialize Firebase safely - won't crash if config files are missing
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('[Firebase] Initialization skipped or failed: $e');
    debugPrint('[Firebase] To enable push notifications, add google-services.json (Android) and GoogleService-Info.plist (iOS)');
  }
  await Hive.initFlutter();
  await LocalStorage.init();
  await Preferences.init();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp, DeviceOrientation.portraitDown]);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(statusBarColor: Colors.transparent, statusBarIconBrightness: Brightness.dark));
  final pushNotificationService = PushNotificationService();
  await pushNotificationService.initialize();
  runApp(ProviderScope(
    child: AppErrorBoundary(child: AcadivoApp()),
  ));
}

class AcadivoApp extends ConsumerStatefulWidget {
  const AcadivoApp({super.key});
  @override ConsumerState<AcadivoApp> createState() => _AcadivoAppState();
}

class _AcadivoAppState extends ConsumerState<AcadivoApp> with WidgetsBindingObserver {
  @override void initState() { super.initState(); WidgetsBinding.instance.addObserver(this); _initSocketOnAuth(); }

  void _initSocketOnAuth() {
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      // Wait for auth to be checked, then connect if authenticated
      ref.listenManual(authProvider, (previous, next) {
        if (next.isAuthenticated && !next.isLoading) {
          _initSocket();
        } else if (!next.isAuthenticated && previous?.isAuthenticated == true) {
          ref.read(socketProvider.notifier).disconnect();
        }
      });
      // Also check current state immediately
      final auth = ref.read(authProvider);
      if (auth.isAuthenticated && !auth.isLoading) {
        _initSocket();
      }
    });
  }

  void _initSocket() {
    try { ref.read(socketProvider.notifier).connect(); } catch (e) { debugPrint('[App] Socket init failed: $e'); }
  }

  @override void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    if (state == AppLifecycleState.resumed) {
      _initSocket();
    } else if (state == AppLifecycleState.detached) {
      ref.read(socketProvider.notifier).disconnect();
    }
  }

  @override void dispose() { WidgetsBinding.instance.removeObserver(this); super.dispose(); }

  @override Widget build(BuildContext context) {
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
      navigatorKey: AppNavigator.navigatorKey,
      builder: (context, child) => MediaQuery(
        data: MediaQuery.of(context).copyWith(textScaler: const TextScaler.linear(1.0)),
        child: _OfflineBanner(child: ErrorBoundaryWidget(fallbackTitle: 'Navigation Error', child: child!)),
      ),
    );
  }
}

class _OfflineBanner extends ConsumerStatefulWidget {
  final Widget child;
  const _OfflineBanner({required this.child});
  @override ConsumerState<_OfflineBanner> createState() => _OfflineBannerState();
}

class _OfflineBannerState extends ConsumerState<_OfflineBanner> {
  @override Widget build(BuildContext context) {
    final isOffline = ref.watch(connectionProvider) == ConnectionStatus.offline;
    final isUrdu = ref.watch(isRtlProvider);
    return Column(children: [
      AnimatedContainer(duration: const Duration(milliseconds: 300), height: isOffline ? 32 : 0, color: Colors.red,
        child: isOffline ? Center(child: Text(isUrdu ? 'آف لائن - کوئی انٹرنیٹ کنکشن نہیں' : 'OFFLINE - No Internet',
          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600))) : null,
      ),
      Expanded(child: widget.child),
    ]);
  }
}
