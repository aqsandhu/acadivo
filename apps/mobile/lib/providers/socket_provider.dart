// lib/providers/socket_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import '../constants/api_constants.dart';
import '../storage/preferences.dart';

enum SocketStatus { disconnected, connecting, connected, error }

class SocketState {
  final SocketStatus status;
  final String? error;

  const SocketState({
    this.status = SocketStatus.disconnected,
    this.error,
  });

  SocketState copyWith({
    SocketStatus? status,
    String? error,
  }) {
    return SocketState(
      status: status ?? this.status,
      error: error,
    );
  }

  bool get isConnected => status == SocketStatus.connected;
}

class SocketNotifier extends StateNotifier<SocketState> {
  io.Socket? _socket;
  final Preferences _preferences;

  SocketNotifier(this._preferences) : super(const SocketState());

  Future<void> connect() async {
    if (_socket != null && _socket!.connected) return;

    state = state.copyWith(status: SocketStatus.connecting);

    try {
      final token = await _preferences.getToken();
      
      _socket = io.io(
        ApiConstants.socketUrl,
        io.OptionBuilder()
            .setTransports(['websocket'])
            .enableAutoConnect()
            .setExtraHeaders({'Authorization': 'Bearer $token'})
            .enableReconnection()
            .setReconnectionDelay(2000)
            .setReconnectionDelayMax(10000)
            .setReconnectionAttempts(5)
            .build(),
      );

      _socket!.onConnect((_) {
        state = const SocketState(status: SocketStatus.connected);
      });

      _socket!.onDisconnect((_) {
        state = const SocketState(status: SocketStatus.disconnected);
      });

      _socket!.onConnectError((error) {
        state = SocketState(status: SocketStatus.error, error: error.toString());
      });

      _socket!.onError((error) {
        state = SocketState(status: SocketStatus.error, error: error.toString());
      });

      _socket!.connect();
    } catch (e) {
      state = SocketState(status: SocketStatus.error, error: e.toString());
    }
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    state = const SocketState(status: SocketStatus.disconnected);
  }

  void on(String event, Function(dynamic) callback) {
    _socket?.on(event, callback);
  }

  void off(String event) {
    _socket?.off(event);
  }

  void emit(String event, dynamic data) {
    if (_socket != null && _socket!.connected) {
      _socket!.emit(event, data);
    }
  }

  void emitWithAck(String event, dynamic data, Function(dynamic) ack) {
    if (_socket != null && _socket!.connected) {
      _socket!.emitWithAck(event, data, ack: ack);
    }
  }

  void joinRoom(String roomId) {
    emit('room:join', {'roomId': roomId});
  }

  void leaveRoom(String roomId) {
    emit('room:leave', {'roomId': roomId});
  }

  @override
  void dispose() {
    disconnect();
    super.dispose();
  }
}

final socketProvider = StateNotifierProvider<SocketNotifier, SocketState>((ref) {
  return SocketNotifier(Preferences.instance);
});

final socketInstanceProvider = Provider<io.Socket?>((ref) {
  return null; // Access through socketProvider notifier
});
