// lib/providers/super_admin_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/super_admin_service.dart';
import 'auth_provider.dart';

class SuperAdminState {
  final List<Map<String, dynamic>> schools;
  final List<Map<String, dynamic>> users;
  final List<Map<String, dynamic>> subscriptions;
  final List<Map<String, dynamic>> advertisements;
  final Map<String, dynamic> analytics;
  final bool isLoading;
  final String? error;

  const SuperAdminState({
    this.schools = const [],
    this.users = const [],
    this.subscriptions = const [],
    this.advertisements = const [],
    this.analytics = const {},
    this.isLoading = false,
    this.error,
  });

  SuperAdminState copyWith({
    List<Map<String, dynamic>>? schools,
    List<Map<String, dynamic>>? users,
    List<Map<String, dynamic>>? subscriptions,
    List<Map<String, dynamic>>? advertisements,
    Map<String, dynamic>? analytics,
    bool? isLoading,
    String? error,
  }) {
    return SuperAdminState(
      schools: schools ?? this.schools,
      users: users ?? this.users,
      subscriptions: subscriptions ?? this.subscriptions,
      advertisements: advertisements ?? this.advertisements,
      analytics: analytics ?? this.analytics,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class SuperAdminNotifier extends StateNotifier<SuperAdminState> {
  final SuperAdminService _service;

  SuperAdminNotifier(this._service) : super(const SuperAdminState());

  Future<void> loadAnalytics() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final data = await _service.getAnalytics();
      state = state.copyWith(analytics: data, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> loadSchools() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final data = await _service.getSchools();
      state = state.copyWith(schools: data, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> loadUsers({String? role}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final data = await _service.getUsers(role: role);
      state = state.copyWith(users: data, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> loadSubscriptions() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final data = await _service.getSubscriptions();
      state = state.copyWith(subscriptions: data, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> loadAdvertisements() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final data = await _service.getAdvertisements();
      state = state.copyWith(advertisements: data, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<bool> createSchool(Map<String, dynamic> data) async {
    try {
      return await _service.createSchool(data);
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

final superAdminServiceProvider = Provider<SuperAdminService>((ref) {
  return SuperAdminService(ref.read(apiServiceProvider));
});

final superAdminProvider = StateNotifierProvider<SuperAdminNotifier, SuperAdminState>((ref) {
  return SuperAdminNotifier(ref.read(superAdminServiceProvider));
});
