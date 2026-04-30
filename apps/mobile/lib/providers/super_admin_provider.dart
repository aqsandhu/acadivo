// lib/providers/super_admin_provider.dart
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/super_admin_service.dart';
import 'auth_provider.dart';

class SuperAdminState {
  final List<Map<String, dynamic>> schools;
  final List<Map<String, dynamic>> users;
  final List<Map<String, dynamic>> subscriptions;
  final List<Map<String, dynamic>> advertisements;
  final Map<String, dynamic> analytics;
  final bool isLoadingSchools;
  final bool isLoadingUsers;
  final bool isLoadingSubscriptions;
  final bool isLoadingAdvertisements;
  final bool isLoadingAnalytics;
  final String? error;

  const SuperAdminState({
    this.schools = const [], this.users = const [], this.subscriptions = const [],
    this.advertisements = const [], this.analytics = const {},
    this.isLoadingSchools = false, this.isLoadingUsers = false,
    this.isLoadingSubscriptions = false, this.isLoadingAdvertisements = false,
    this.isLoadingAnalytics = false, this.error,
  });

  SuperAdminState copyWith({
    List<Map<String, dynamic>>? schools, List<Map<String, dynamic>>? users,
    List<Map<String, dynamic>>? subscriptions, List<Map<String, dynamic>>? advertisements,
    Map<String, dynamic>? analytics, bool? isLoadingSchools, bool? isLoadingUsers,
    bool? isLoadingSubscriptions, bool? isLoadingAdvertisements, bool? isLoadingAnalytics, String? error,
  }) => SuperAdminState(
    schools: schools ?? this.schools, users: users ?? this.users,
    subscriptions: subscriptions ?? this.subscriptions, advertisements: advertisements ?? this.advertisements,
    analytics: analytics ?? this.analytics, isLoadingSchools: isLoadingSchools ?? this.isLoadingSchools,
    isLoadingUsers: isLoadingUsers ?? this.isLoadingUsers, isLoadingSubscriptions: isLoadingSubscriptions ?? this.isLoadingSubscriptions,
    isLoadingAdvertisements: isLoadingAdvertisements ?? this.isLoadingAdvertisements, isLoadingAnalytics: isLoadingAnalytics ?? this.isLoadingAnalytics,
    error: error,
  );

  bool get isAnyLoading => isLoadingSchools || isLoadingUsers || isLoadingSubscriptions || isLoadingAdvertisements || isLoadingAnalytics;
  bool get hasError => error != null && error!.isNotEmpty;
}

class SuperAdminNotifier extends StateNotifier<SuperAdminState> {
  final SuperAdminService _service;
  SuperAdminNotifier(this._service) : super(const SuperAdminState());

  Future<void> loadAll() async {
    await Future.wait([loadAnalytics(), loadSchools(), loadUsers(), loadSubscriptions(), loadAdvertisements()]);
  }

  Future<void> loadAnalytics() async {
    state = state.copyWith(isLoadingAnalytics: true, error: null);
    try { state = state.copyWith(analytics: await _service.getAnalytics(), isLoadingAnalytics: false); }
    catch (e) { state = state.copyWith(isLoadingAnalytics: false, error: 'Analytics: $e'); }
  }

  Future<void> loadSchools() async {
    state = state.copyWith(isLoadingSchools: true, error: null);
    try { state = state.copyWith(schools: await _service.getSchools(), isLoadingSchools: false); }
    catch (e) { state = state.copyWith(isLoadingSchools: false, error: 'Schools: $e'); }
  }

  Future<void> loadUsers({String? role}) async {
    state = state.copyWith(isLoadingUsers: true, error: null);
    try { state = state.copyWith(users: await _service.getUsers(role: role), isLoadingUsers: false); }
    catch (e) { state = state.copyWith(isLoadingUsers: false, error: 'Users: $e'); }
  }

  Future<void> loadSubscriptions() async {
    state = state.copyWith(isLoadingSubscriptions: true, error: null);
    try { state = state.copyWith(subscriptions: await _service.getSubscriptions(), isLoadingSubscriptions: false); }
    catch (e) { state = state.copyWith(isLoadingSubscriptions: false, error: 'Subscriptions: $e'); }
  }

  Future<void> loadAdvertisements() async {
    state = state.copyWith(isLoadingAdvertisements: true, error: null);
    try { state = state.copyWith(advertisements: await _service.getAdvertisements(), isLoadingAdvertisements: false); }
    catch (e) { state = state.copyWith(isLoadingAdvertisements: false, error: 'Ads: $e'); }
  }

  Future<bool> createSchool(Map<String, dynamic> data) async {
    try { final success = await _service.createSchool(data); if (success) await loadSchools(); return success; }
    catch (e) { state = state.copyWith(error: e.toString()); return false; }
  }

  Future<bool> updateSchool(String schoolId, Map<String, dynamic> data) async {
    try { final success = await _service.updateSchool(schoolId, data); if (success) await loadSchools(); return success; }
    catch (e) { state = state.copyWith(error: e.toString()); return false; }
  }

  Future<bool> updateSchoolStatus(String schoolId, String status) async => await updateSchool(schoolId, {'status': status});
  Future<bool> updateSubscription(String id, Map<String, dynamic> data) async {
    try { final success = await _service.updateSubscription(id, data); if (success) await loadSubscriptions(); return success; }
    catch (e) { state = state.copyWith(error: e.toString()); return false; }
  }

  Future<void> refresh() async => await loadAll();
  void clearError() => state = state.copyWith(error: null);
}

final superAdminServiceProvider = Provider<SuperAdminService>((ref) => SuperAdminService(ref.read(apiServiceProvider)));
final superAdminProvider = StateNotifierProvider<SuperAdminNotifier, SuperAdminState>((ref) => SuperAdminNotifier(ref.read(superAdminServiceProvider)));
