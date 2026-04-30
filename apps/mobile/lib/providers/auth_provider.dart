// lib/providers/auth_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/user_model.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../storage/preferences.dart';

/// Auth state class
class AuthState {
  final UserModel? user;
  final String? token;
  final bool isAuthenticated;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.user,
    this.token,
    this.isAuthenticated = false,
    this.isLoading = false,
    this.error,
  });

  /// Redirect route based on user role
  String? get redirectRoute {
    switch (user?.role) {
      case UserRole.schoolAdmin:
        return '/admin/dashboard';
      case UserRole.principal:
        return '/principal/dashboard';
      case UserRole.teacher:
        return '/teacher/dashboard';
      case UserRole.student:
        return '/student/dashboard';
      case UserRole.parent:
        return '/parent/dashboard';
      default:
        return '/login';
    }
  }

  AuthState copyWith({
    UserModel? user,
    String? token,
    bool? isAuthenticated,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      token: token ?? this.token,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Auth Notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  final Preferences _preferences;

  AuthNotifier(this._authService, this._preferences) : super(const AuthState()) {
    _checkAuth();
  }

  /// Check existing auth on app start
  Future<void> _checkAuth() async {
    state = state.copyWith(isLoading: true);
    try {
      final token = await _preferences.getToken();
      if (token != null && token.isNotEmpty) {
        final user = await _authService.getMe();
        if (user != null) {
          state = AuthState(
            user: user,
            token: token,
            isAuthenticated: true,
            isLoading: false,
          );
        } else {
          await logout();
        }
      } else {
        state = const AuthState(isLoading: false);
      }
    } catch (e) {
      state = AuthState(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Login
  Future<bool> login({required String uniqueId, required String password}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final result = await _authService.login(
        uniqueId: uniqueId,
        password: password,
      );

      if (result != null && result.user != null) {
        state = AuthState(
          user: result.user,
          token: result.token,
          isAuthenticated: true,
          isLoading: false,
        );
        return true;
      }

      state = const AuthState(
        isLoading: false,
        error: 'Invalid credentials',
      );
      return false;
    } catch (e) {
      state = AuthState(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    try {
      await _authService.logout();
    } catch (_) {
      // Ignore errors during logout
    }
    state = const AuthState(isLoading: false);
  }

  /// Refresh token
  Future<bool> refreshToken() async {
    try {
      final refreshToken = await _preferences.getRefreshToken();
      if (refreshToken == null) return false;

      final result = await _authService.refreshToken(refreshToken);
      if (result != null && result.user != null) {
        state = AuthState(
          user: result.user,
          token: result.token,
          isAuthenticated: true,
          isLoading: false,
        );
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /// Update user data
  Future<bool> updateUser(UserModel user) async {
    try {
      final updatedUser = await _authService.updateProfile(user.toJson());
      if (updatedUser != null) {
        state = state.copyWith(user: updatedUser);
        return true;
      }
      return false;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  /// Change password
  Future<bool> changePassword({required String oldPassword, required String newPassword}) async {
    try {
      return await _authService.changePassword(
        oldPassword: oldPassword,
        newPassword: newPassword,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }
}

// Provider definitions
final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiServiceProvider.instance;
});

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref.read(apiServiceProvider));
});

final preferencesProvider = Provider<Preferences>((ref) {
  return Preferences.instance;
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.read(authServiceProvider),
    ref.read(preferencesProvider),
  );
});

// Derived providers
final currentUserProvider = Provider<UserModel?>((ref) {
  return ref.watch(authProvider).user;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isAuthenticated;
});

final userRoleProvider = Provider<UserRole>((ref) {
  return ref.watch(authProvider).user?.role ?? UserRole.unknown;
});

final authLoadingProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isLoading;
});
