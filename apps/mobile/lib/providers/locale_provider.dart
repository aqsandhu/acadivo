// lib/providers/locale_provider.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../constants/app_constants.dart';
import '../constants/storage_keys.dart';

class LocaleNotifier extends StateNotifier<Locale> {
  LocaleNotifier() : super(AppConstants.englishLocale) {
    _loadLocale();
  }

  Future<void> _loadLocale() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(StorageKeys.locale);
    if (saved != null) {
      state = Locale(saved);
    }
  }

  Future<void> setLocale(Locale locale) async {
    state = locale;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(StorageKeys.locale, locale.languageCode);
  }

  Future<void> toggleLocale() async {
    final newLocale = state.languageCode == 'en'
        ? AppConstants.urduLocale
        : AppConstants.englishLocale;
    await setLocale(newLocale);
  }

  bool get isUrdu => state.languageCode == 'ur';
  bool get isEnglish => state.languageCode == 'en';
  TextDirection get textDirection =>
      isUrdu ? TextDirection.rtl : TextDirection.ltr;
}

final localeProvider = StateNotifierProvider<LocaleNotifier, Locale>((ref) {
  return LocaleNotifier();
});

final isRtlProvider = Provider<bool>((ref) {
  return ref.watch(localeProvider).languageCode == 'ur';
});
