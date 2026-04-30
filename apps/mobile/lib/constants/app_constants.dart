// lib/constants/app_constants.dart
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import '../utils/app_localizations.dart';

class AppConstants {
  AppConstants._();

  static const String appName = 'Acadivo';
  static const String appTagline = 'Smart Education for Pakistan';
  static const String appVersion = '1.0.0';
  static const String packageName = 'com.acadivo.app';

  // Locales
  static const Locale englishLocale = Locale('en', 'US');
  static const Locale urduLocale = Locale('ur', 'PK');
  static const List<Locale> supportedLocales = [englishLocale, urduLocale];

  // Localization delegates
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates = [
    AppLocalizations.delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
  ];

  // Timeouts
  static const Duration apiTimeout = Duration(seconds: 30);
  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 30);

  // Limits
  static const int maxImageSizeBytes = 5 * 1024 * 1024; // 5MB
  static const int maxFileSizeBytes = 10 * 1024 * 1024; // 10MB
  static const int maxMessagesPerPage = 50;
  static const int maxNotificationsPerPage = 50;
  static const int maxRetryAttempts = 3;

  // Cache durations
  static const Duration cacheDuration = Duration(hours: 24);
  static const Duration shortCacheDuration = Duration(minutes: 5);

  // Currency
  static const String defaultCurrency = 'PKR';
  static const String currencySymbol = 'Rs.';

  // Date formats
  static const String dateFormat = 'dd MMM yyyy';
  static const String dateTimeFormat = 'dd MMM yyyy, hh:mm a';
  static const String timeFormat = 'hh:mm a';
  static const String isoDateFormat = 'yyyy-MM-dd';
}
