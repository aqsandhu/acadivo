import 'package:flutter/material.dart';
import 'custom_app_bar.dart';
import 'bottom_nav_bar.dart';
import 'drawer_menu.dart';

class AppScaffold extends StatelessWidget {
  final String? title;
  final Widget? body;
  final Widget? child;
  final List<Widget>? actions;
  final bool showBackButton;
  final bool showBottomNav;
  final bool showDrawer;
  final int currentIndex;
  final ValueChanged<int>? onNavChanged;
  final String? role;
  final Widget? floatingActionButton;
  final Widget? bottomSheet;
  final Color? backgroundColor;
  final PreferredSizeWidget? customAppBar;
  final bool isUrdu;

  const AppScaffold({
    super.key,
    this.title,
    this.body,
    this.child,
    this.actions,
    this.showBackButton = true,
    this.showBottomNav = false,
    this.showDrawer = false,
    this.currentIndex = 0,
    this.onNavChanged,
    this.role,
    this.floatingActionButton,
    this.bottomSheet,
    this.backgroundColor,
    this.customAppBar,
    this.isUrdu = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final content = child ?? body;

    return Scaffold(
      backgroundColor: backgroundColor ?? theme.colorScheme.background,
      appBar: child == null
          ? (customAppBar ?? CustomAppBar(
              title: title ?? '',
              actions: actions,
              showBackButton: showBackButton,
              isUrdu: isUrdu,
            ))
          : null,
      drawer: showDrawer
          ? DrawerMenu(
              userName: 'User',
              role: role ?? 'user',
              items: const [],
            )
          : null,
      body: content,
      floatingActionButton: floatingActionButton,
      bottomSheet: bottomSheet,
      bottomNavigationBar: showBottomNav && role != null
          ? BottomNavBar(
              currentIndex: currentIndex,
              onTap: onNavChanged ?? (_) {},
              role: role!,
            )
          : null,
    );
  }
}
