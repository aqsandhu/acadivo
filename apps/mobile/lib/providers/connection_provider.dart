// lib/providers/connection_provider.dart
import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum ConnectionStatus { online, offline, unknown }

class ConnectionNotifier extends StateNotifier<ConnectionStatus> {
  late final StreamSubscription<List<ConnectivityResult>> _subscription;

  ConnectionNotifier() : super(ConnectionStatus.unknown) {
    _init();
  }

  void _init() {
    _subscription = Connectivity().onConnectivityChanged.listen((results) {
      _updateStatus(results);
    });
    _checkInitial();
  }

  Future<void> _checkInitial() async {
    final results = await Connectivity().checkConnectivity();
    _updateStatus([results]);
  }

  void _updateStatus(List<ConnectivityResult> results) {
    final hasConnection = results.any(
      (result) =>
          result == ConnectivityResult.wifi ||
          result == ConnectivityResult.mobile ||
          result == ConnectivityResult.ethernet,
    );
    state = hasConnection ? ConnectionStatus.online : ConnectionStatus.offline;
  }

  bool get isOnline => state == ConnectionStatus.online;
  bool get isOffline => state == ConnectionStatus.offline;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}

final connectionProvider =
    StateNotifierProvider<ConnectionNotifier, ConnectionStatus>((ref) {
  return ConnectionNotifier();
});

final isOnlineProvider = Provider<bool>((ref) {
  return ref.watch(connectionProvider) == ConnectionStatus.online;
});
