import 'package:flutter/material.dart';
import 'custom_app_bar.dart';
import 'bottom_nav_bar.dart';
import 'drawer_menu.dart';

class AppScaffold extends StatelessWidget {
  final String title;
  final Widget body;
  final List<Widget>? actions;
  final bool showBackButton;
  final bool showBottomNav;
  final bool showDrawer;
  final int currentNavIndex;
  final ValueChanged<int>? onNavChanged;
  final String? role;
  final Widget? floatingActionButton;
  final Widget? bottomSheet;
  final Color? backgroundColor;
  final PreferredSizeWidget? customAppBar;
  final bool isUrdu;

  const AppScaffold({
    super.key,
    required this.title,
    required this.body,
    this.actions,
    this.showBackButton = true,
    this.showBottomNav = false,
    this.showDrawer = false,
    this.currentNavIndex = 0,
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

    return Scaffold(
      backgroundColor: backgroundColor ?? theme.colorScheme.background,
      appBar: customAppBar ?? CustomAppBar(
        title: title,
        actions: actions,
        showBackButton: showBackButton,
        isUrdu: isUrdu,
      ),
      drawer: showDrawer
          ? DrawerMenu(
              userName: 'User',
              role: role ?? 'user',
              items: const [],
            )
          : null,
      body: body,
      floatingActionButton: floatingActionButton,
      bottomSheet: bottomSheet,
      bottomNavigationBar: showBottomNav && role != null
          ? BottomNavBar(
              currentIndex: currentNavIndex,
              onTap: onNavChanged ?? (_) {},
              role: role!,
            )
          : null,
    );
  }
}
