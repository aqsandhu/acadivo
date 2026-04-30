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
  Object? _error;
  StackTrace? _stackTrace;

  @override
  void initState() {
    super.initState();
    // Catch framework errors in this zone
    FlutterError.onError = _handleFlutterError;
  }

  void _handleFlutterError(FlutterErrorDetails details) {
    if (mounted) {
      setState(() {
        _error = details.exception;
        _stackTrace = details.stack;
      });
    }
    // Still report to console
    FlutterError.presentError(details);
  }

  void _reset() {
    setState(() {
      _error = null;
      _stackTrace = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) {
      return _AppErrorFallback(
        message: _error.toString(),
        onRetry: _reset,
      );
    }
    return widget.child;
  }

  @override
  void dispose() {
    // Only reset if this was the one that set it
    if (FlutterError.onError == _handleFlutterError) {
      FlutterError.onError = FlutterError.presentError;
    }
    super.dispose();
  }
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

class _AppErrorFallback extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _AppErrorFallback({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Material(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: theme.colorScheme.errorContainer.withOpacity(0.3),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.error_outline, size: 56, color: theme.colorScheme.error),
              ),
              const SizedBox(height: 24),
              Text(
                'Something went wrong',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w600),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                message,
                style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: const Text('Restart'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
