// lib/widgets/cached_image_widget.dart
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class CachedImageWidget extends StatelessWidget {
  final String? imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final double borderRadius;
  const CachedImageWidget({super.key, required this.imageUrl, this.width, this.height, this.fit = BoxFit.cover, this.borderRadius = 0});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (imageUrl == null || imageUrl!.isEmpty) {
      return Container(width: width, height: height,
        decoration: BoxDecoration(color: theme.colorScheme.surfaceContainerHighest, borderRadius: BorderRadius.circular(borderRadius)),
        child: Icon(Icons.image_outlined, color: theme.colorScheme.onSurfaceVariant.withOpacity(0.5), size: (width != null ? width! * 0.3 : 32).clamp(24, 48)),);
    }
    return ClipRRect(borderRadius: BorderRadius.circular(borderRadius),
      child: CachedNetworkImage(imageUrl: imageUrl!, width: width, height: height, fit: fit,
        fadeInDuration: const Duration(milliseconds: 300),
        placeholder: (context, url) => Shimmer.fromColors(
          baseColor: theme.colorScheme.surfaceContainerHighest,
          highlightColor: theme.colorScheme.surfaceContainerHighest.withOpacity(0.5),
          child: Container(width: width, height: height, color: theme.colorScheme.surfaceContainerHighest),),
        errorWidget: (context, url, error) => Container(width: width, height: height,
          decoration: BoxDecoration(color: theme.colorScheme.errorContainer.withOpacity(0.2), borderRadius: BorderRadius.circular(borderRadius)),
          child: Center(child: Icon(Icons.broken_image_outlined, color: theme.colorScheme.error.withOpacity(0.6), size: (width != null ? width! * 0.25 : 28).clamp(20, 40))),),
        memCacheWidth: width != null ? (width! * 2).toInt() : null,
        memCacheHeight: height != null ? (height! * 2).toInt() : null,
      ),);
  }
}

class CachedAvatarWidget extends StatelessWidget {
  final String? imageUrl;
  final double radius;
  final String? fallbackText;
  const CachedAvatarWidget({super.key, this.imageUrl, this.radius = 24, this.fallbackText});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (imageUrl == null || imageUrl!.isEmpty) {
      return CircleAvatar(radius: radius,
        backgroundColor: theme.colorScheme.primaryContainer,
        child: fallbackText != null && fallbackText!.isNotEmpty
          ? Text(fallbackText![0].toUpperCase(), style: theme.textTheme.titleMedium?.copyWith(color: theme.colorScheme.onPrimaryContainer, fontWeight: FontWeight.bold))
          : Icon(Icons.person_outline, size: radius, color: theme.colorScheme.onPrimaryContainer),);
    }
    return CachedNetworkImage(imageUrl: imageUrl!, imageBuilder: (context, ip) => CircleAvatar(radius: radius, backgroundImage: ip),
      placeholder: (context, url) => Shimmer.fromColors(
        baseColor: theme.colorScheme.surfaceContainerHighest, highlightColor: theme.colorScheme.surfaceContainerHighest.withOpacity(0.5),
        child: CircleAvatar(radius: radius, backgroundColor: theme.colorScheme.surfaceContainerHighest),),
      errorWidget: (context, url, error) => CircleAvatar(radius: radius,
        backgroundColor: theme.colorScheme.primaryContainer,
        child: fallbackText != null && fallbackText!.isNotEmpty
          ? Text(fallbackText![0].toUpperCase(), style: theme.textTheme.titleMedium?.copyWith(color: theme.colorScheme.onPrimaryContainer, fontWeight: FontWeight.bold))
          : Icon(Icons.person_outline, size: radius, color: theme.colorScheme.onPrimaryContainer),),
      memCacheWidth: (radius * 4).toInt(), memCacheHeight: (radius * 4).toInt(),
    );
  }
}
