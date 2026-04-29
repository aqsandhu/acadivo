import 'package:flutter/material.dart';

class PullToRefresh extends StatelessWidget {
  final Widget child;
  final Future<void> Function() onRefresh;

  const PullToRefresh({
    super.key,
    required this.child,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      color: Theme.of(context).colorScheme.primary,
      backgroundColor: Theme.of(context).colorScheme.surface,
      child: child,
    );
  }
}
