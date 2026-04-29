import 'package:flutter/material.dart';

class StatusBadge extends StatelessWidget {
  final String label;
  final Color? color;
  final StatusType type;

  const StatusBadge({
    super.key,
    required this.label,
    this.color,
    this.type = StatusType.info,
  });

  Color _resolveColor(BuildContext context) {
    if (color != null) return color!;
    final scheme = Theme.of(context).colorScheme;
    switch (type) {
      case StatusType.success:
        return const Color(0xFF10B981);
      case StatusType.danger:
        return const Color(0xFFEF4444);
      case StatusType.warning:
        return const Color(0xFFF59E0B);
      case StatusType.info:
        return const Color(0xFF3B82F6);
      case StatusType.primary:
        return const Color(0xFF1E40AF);
    }
  }

  @override
  Widget build(BuildContext context) {
    final effectiveColor = _resolveColor(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: effectiveColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: effectiveColor.withOpacity(0.3),
        ),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: effectiveColor,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

enum StatusType {
  success,
  danger,
  warning,
  info,
  primary,
}
