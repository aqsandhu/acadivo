import 'dart:convert';
import 'dart:io';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class OfflineQueueService {
  static const String _queueKey = 'offline_queue';
  static const String _settingsKey = 'app_settings';

  static Future<void> enqueue({
    required String method,
    required String url,
    Map<String, String>? headers,
    Object? body,
    File? file,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final queue = _getQueue(prefs);
    queue.add({
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'method': method,
      'url': url,
      'headers': headers,
      'body': body != null ? jsonEncode(body) : null,
      'timestamp': DateTime.now().toIso8601String(),
    });
    await prefs.setString(_queueKey, jsonEncode(queue));
  }

  static List<Map<String, dynamic>> _getQueue(SharedPreferences prefs) {
    final raw = prefs.getString(_queueKey);
    if (raw == null) return [];
    try {
      return List<Map<String, dynamic>>.from(jsonDecode(raw));
    } catch (_) {
      return [];
    }
  }

  static Future<void> processQueue() async {
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) return;

    final prefs = await SharedPreferences.getInstance();
    final queue = _getQueue(prefs);
    if (queue.isEmpty) return;

    final failed = <Map<String, dynamic>>[];
    for (final item in queue) {
      try {
        final method = item['method'] as String;
        final url = item['url'] as String;
        final headers = item['headers'] != null
            ? Map<String, String>.from(item['headers'] as Map)
            : <String, String>{};
        final body = item['body'] as String?;

        switch (method.toUpperCase()) {
          case 'POST':
            await http.post(Uri.parse(url), headers: headers, body: body);
            break;
          case 'PUT':
            await http.put(Uri.parse(url), headers: headers, body: body);
            break;
          case 'DELETE':
            await http.delete(Uri.parse(url), headers: headers);
            break;
          case 'PATCH':
            await http.patch(Uri.parse(url), headers: headers, body: body);
            break;
        }
      } catch (_) {
        failed.add(item);
      }
    }

    await prefs.setString(_queueKey, jsonEncode(failed));
  }

  static Future<void> clearQueue() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_queueKey);
  }

  static Future<bool> getDataSaverMode() async {
    final prefs = await SharedPreferences.getInstance();
    final settings = jsonDecode(prefs.getString(_settingsKey) ?? '{}') as Map<String, dynamic>;
    return settings['dataSaver'] ?? false;
  }

  static Future<void> setDataSaverMode(bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    final settings = jsonDecode(prefs.getString(_settingsKey) ?? '{}') as Map<String, dynamic>;
    settings['dataSaver'] = enabled;
    await prefs.setString(_settingsKey, jsonEncode(settings));
  }
}
