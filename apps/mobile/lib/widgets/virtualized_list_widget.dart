// lib/widgets/virtualized_list_widget.dart
import 'package:flutter/material.dart';

class VirtualizedListWidget<T> extends StatelessWidget {
  final List<T> items;
  final Widget Function(BuildContext, T, int) itemBuilder;
  final Widget? separatorBuilder;
  final ScrollController? scrollController;
  final Future<void> Function()? onRefresh;
  final Future<void> Function()? onLoadMore;
  final bool isLoadingMore;
  final bool isLoading;
  final Widget? emptyWidget;
  final String? emptyMessage;
  final EdgeInsets padding;
  final bool shrinkWrap;
  const VirtualizedListWidget({super.key, required this.items, required this.itemBuilder, this.separatorBuilder,
    this.scrollController, this.onRefresh, this.onLoadMore, this.isLoadingMore = false, this.isLoading = false,
    this.emptyWidget, this.emptyMessage, this.padding = EdgeInsets.zero, this.shrinkWrap = false});

  @override
  Widget build(BuildContext context) {
    if (isLoading && items.isEmpty) return _LoadingList(separatorBuilder: separatorBuilder);
    if (items.isEmpty) return emptyWidget ?? _EmptyList(message: emptyMessage ?? 'No items found');
    Widget list = ListView.separated(controller: scrollController, padding: padding, shrinkWrap: shrinkWrap,
      physics: const AlwaysScrollableScrollPhysics(), itemCount: items.length + (isLoadingMore ? 1 : 0),
      cacheExtent: 200, addAutomaticKeepAlives: false, addRepaintBoundaries: true,
      itemBuilder: (context, index) {
        if (index >= items.length) return const Padding(padding: EdgeInsets.all(16), child: Center(child: CircularProgressIndicator(strokeWidth: 2)));
        return itemBuilder(context, items[index], index);
      },
      separatorBuilder: (context, index) => separatorBuilder ?? const SizedBox.shrink(),
    );
    if (onRefresh != null) list = RefreshIndicator(onRefresh: onRefresh!, child: list);
    return list;
  }
}

class _LoadingList extends StatelessWidget {
  final Widget? separatorBuilder;
  const _LoadingList({this.separatorBuilder});
  @override Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ListView.separated(physics: const NeverScrollableScrollPhysics(), shrinkWrap: true, itemCount: 8,
      itemBuilder: (context, index) => Padding(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(children: [Container(width: 48, height: 48, decoration: BoxDecoration(color: theme.colorScheme.surfaceContainerHighest, borderRadius: BorderRadius.circular(8))),
          const SizedBox(width: 16), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(width: double.infinity, height: 14, decoration: BoxDecoration(color: theme.colorScheme.surfaceContainerHighest, borderRadius: BorderRadius.circular(4))),
            const SizedBox(height: 8), Container(width: 150, height: 12, decoration: BoxDecoration(color: theme.colorScheme.surfaceContainerHighest, borderRadius: BorderRadius.circular(4))),
          ])),],),),
      separatorBuilder: (context, index) => separatorBuilder ?? Divider(height: 1, color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
    );
  }
}

class _EmptyList extends StatelessWidget {
  final String message;
  const _EmptyList({required this.message});
  @override Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(child: Padding(padding: const EdgeInsets.all(32),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(Icons.inbox_outlined, size: 64, color: theme.colorScheme.onSurfaceVariant.withOpacity(0.5)),
        const SizedBox(height: 16),
        Text(message, style: theme.textTheme.titleMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant), textAlign: TextAlign.center),
      ]),),);
  }
}
