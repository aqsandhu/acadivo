import 'dart:io';
import 'dart:typed_data';
import 'package:flutter_image_compress/flutter_image_compress.dart';

class ImageCompressionService {
  static const int _defaultQuality = 70;
  static const int _dataSaverQuality = 40;
  static const int _defaultMaxWidth = 1080;
  static const int _defaultMaxHeight = 1080;
  static const int _dataSaverMaxWidth = 640;
  static const int _dataSaverMaxHeight = 640;

  static Future<XFile?> compressImage(
    File file, {
    bool dataSaver = false,
  }) async {
    final quality = dataSaver ? _dataSaverQuality : _defaultQuality;
    final maxWidth = dataSaver ? _dataSaverMaxWidth : _defaultMaxWidth;
    final maxHeight = dataSaver ? _dataSaverMaxHeight : _defaultMaxHeight;

    final result = await FlutterImageCompress.compressWithFile(
      file.absolute.path,
      quality: quality,
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      format: CompressFormat.jpeg,
    );

    if (result == null) return null;

    // Write compressed bytes to temp file
    final tempPath = '${file.parent.path}/compressed_${DateTime.now().millisecondsSinceEpoch}.jpg';
    final tempFile = File(tempPath);
    await tempFile.writeAsBytes(result);
    return XFile(tempPath);
  }

  static Future<Uint8List?> compressImageBytes(
    Uint8List bytes, {
    bool dataSaver = false,
  }) async {
    final quality = dataSaver ? _dataSaverQuality : _defaultQuality;
    final maxWidth = dataSaver ? _dataSaverMaxWidth : _defaultMaxWidth;
    final maxHeight = dataSaver ? _dataSaverMaxHeight : _defaultMaxHeight;

    return await FlutterImageCompress.compressWithList(
      bytes,
      quality: quality,
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      format: CompressFormat.jpeg,
    );
  }
}

class XFile {
  final String path;
  XFile(this.path);
}
