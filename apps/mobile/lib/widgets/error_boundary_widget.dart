// lib/widgets/error_boundary_widget.dart
import 'package:flutter/material.dart';

class ErrorBoundaryWidget extends StatefulWidget {
  final Widget child;
  final String? fallbackTitle;
  final VoidCallback? onRetry;
  const ErrorBoundaryWidget({super.key, required this.child, this.fallbackTitle, this.onRetry});
  @override State<ErrorBoundaryWidget> createState() => _ErrorBoundaryWidgetState();
}

class _ErrorBoundaryWidgetState extends State<ErrorBoundaryWidget> {
  Object? _error;
  void _reset() => setState(() => _error = null);
  @override Widget build(BuildContext context) {
    if (_error != null) {
      return _ErrorFallback(title: widget.fallbackTitle ?? 'Error', message: _error.toString(), onRetry: widget.onRetry != null ? () { _reset(); widget.onRetry!(); } : null);
    }
    return widget.child;
  }
}

class AppErrorBoundary extends StatefulWidget {
  final Widget child;
  const AppErrorBoundary({super.key, required this.child});
  @override State<AppErrorBoundary> createState() => _AppErrorBoundaryState();
}

class _AppErrorBoundaryState extends State<AppErrorBoundary> {
  @override Widget build(BuildContext context) => widget.child;
}

class _ErrorFallback extends StatelessWidget {
  final String title;
  final String message;
  final VoidCallback? onRetry;
  const _ErrorFallback({required this.title, required this.message, this.onRetry});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(child: Padding(padding: const EdgeInsets.all(32),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Container(padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(color: theme.colorScheme.errorContainer.withOpacity(0.3), shape: BoxShape.circle),
          child: Icon(Icons.error_outline, size: 56, color: theme.colorScheme.error),),
        const SizedBox(height: 24),
        Text(title, style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w600), textAlign: TextAlign.center),
        const SizedBox(height: 8),
        Text(message, style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant), textAlign: TextAlign.center),
        if (onRetry != null) ...[const SizedBox(height: 24), FilledButton.icon(onPressed: onRetry, icon: const Icon(Icons.refresh), label: const Text('Try Again'))],
      ]),),);
  }
}
