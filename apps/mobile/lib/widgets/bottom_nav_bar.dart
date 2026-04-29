import 'package:flutter/material.dart';

class BottomNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final String role;

  const BottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.role,
  });

  List<BottomNavItem> get _items {
    switch (role) {
      case 'teacher':
        return const [
          BottomNavItem(icon: Icons.dashboard_outlined, activeIcon: Icons.dashboard, label: 'Dashboard'),
          BottomNavItem(icon: Icons.class_outlined, activeIcon: Icons.class_, label: 'Classes'),
          BottomNavItem(icon: Icons.assignment_outlined, activeIcon: Icons.assignment, label: 'Homework'),
          BottomNavItem(icon: Icons.message_outlined, activeIcon: Icons.message, label: 'Messages'),
          BottomNavItem(icon: Icons.person_outline, activeIcon: Icons.person, label: 'Profile'),
        ];
      case 'student':
        return const [
          BottomNavItem(icon: Icons.dashboard_outlined, activeIcon: Icons.dashboard, label: 'Dashboard'),
          BottomNavItem(icon: Icons.schedule_outlined, activeIcon: Icons.schedule, label: 'Timetable'),
          BottomNavItem(icon: Icons.assignment_outlined, activeIcon: Icons.assignment, label: 'Homework'),
          BottomNavItem(icon: Icons.message_outlined, activeIcon: Icons.message, label: 'Messages'),
          BottomNavItem(icon: Icons.person_outline, activeIcon: Icons.person, label: 'Profile'),
        ];
      case 'parent':
        return const [
          BottomNavItem(icon: Icons.dashboard_outlined, activeIcon: Icons.dashboard, label: 'Dashboard'),
          BottomNavItem(icon: Icons.family_restroom_outlined, activeIcon: Icons.family_restroom, label: 'Children'),
          BottomNavItem(icon: Icons.payment_outlined, activeIcon: Icons.payment, label: 'Fee'),
          BottomNavItem(icon: Icons.message_outlined, activeIcon: Icons.message, label: 'Messages'),
          BottomNavItem(icon: Icons.person_outline, activeIcon: Icons.person, label: 'Profile'),
        ];
      case 'admin':
        return const [
          BottomNavItem(icon: Icons.dashboard_outlined, activeIcon: Icons.dashboard, label: 'Dashboard'),
          BottomNavItem(icon: Icons.people_outline, activeIcon: Icons.people, label: 'Users'),
          BottomNavItem(icon: Icons.school_outlined, activeIcon: Icons.school, label: 'School'),
          BottomNavItem(icon: Icons.settings_outlined, activeIcon: Icons.settings, label: 'Settings'),
          BottomNavItem(icon: Icons.person_outline, activeIcon: Icons.person, label: 'Profile'),
        ];
      case 'principal':
        return const [
          BottomNavItem(icon: Icons.dashboard_outlined, activeIcon: Icons.dashboard, label: 'Dashboard'),
          BottomNavItem(icon: Icons.people_outline, activeIcon: Icons.people, label: 'Staff'),
          BottomNavItem(icon: Icons.announcement_outlined, activeIcon: Icons.announcement, label: 'Notices'),
          BottomNavItem(icon: Icons.bar_chart_outlined, activeIcon: Icons.bar_chart, label: 'Reports'),
          BottomNavItem(icon: Icons.person_outline, activeIcon: Icons.person, label: 'Profile'),
        ];
      case 'super_admin':
        return const [
          BottomNavItem(icon: Icons.dashboard_outlined, activeIcon: Icons.dashboard, label: 'Dashboard'),
          BottomNavItem(icon: Icons.business_outlined, activeIcon: Icons.business, label: 'Schools'),
          BottomNavItem(icon: Icons.analytics_outlined, activeIcon: Icons.analytics, label: 'Analytics'),
          BottomNavItem(icon: Icons.payment_outlined, activeIcon: Icons.payment, label: 'Billing'),
          BottomNavItem(icon: Icons.person_outline, activeIcon: Icons.person, label: 'Profile'),
        ];
      default:
        return const [
          BottomNavItem(icon: Icons.home_outlined, activeIcon: Icons.home, label: 'Home'),
          BottomNavItem(icon: Icons.settings_outlined, activeIcon: Icons.settings, label: 'Settings'),
        ];
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final items = _items;

    return NavigationBar(
      selectedIndex: currentIndex,
      onDestinationSelected: onTap,
      backgroundColor: theme.colorScheme.surface,
      indicatorColor: theme.colorScheme.primaryContainer,
      destinations: items.map((item) {
        return NavigationDestination(
          icon: Icon(item.icon),
          selectedIcon: Icon(item.activeIcon, color: theme.colorScheme.primary),
          label: item.label,
        );
      }).toList(),
    );
  }
}

class BottomNavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;

  const BottomNavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}
