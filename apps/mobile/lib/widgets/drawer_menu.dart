import 'package:flutter/material.dart';
import 'user_avatar.dart';

class DrawerMenu extends StatelessWidget {
  final String userName;
  final String role;
  final String? avatarUrl;
  final String? schoolName;
  final VoidCallback? onLogout;
  final List<DrawerItem> items;

  const DrawerMenu({
    super.key,
    required this.userName,
    required this.role,
    this.avatarUrl,
    this.schoolName,
    this.onLogout,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Drawer(
      child: SafeArea(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              color: theme.colorScheme.primaryContainer.withOpacity(0.3),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  UserAvatar(
                    imageUrl: avatarUrl,
                    name: userName,
                    size: 64,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    userName,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    role.toUpperCase(),
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (schoolName != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      schoolName!,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(vertical: 8),
                itemCount: items.length,
                itemBuilder: (context, index) {
                  final item = items[index];
                  return ListTile(
                    leading: Icon(item.icon, color: theme.colorScheme.onSurfaceVariant),
                    title: Text(
                      item.title,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: item.isActive ? FontWeight.w600 : FontWeight.normal,
                        color: item.isActive ? theme.colorScheme.primary : null,
                      ),
                    ),
                    trailing: item.badgeCount != null && item.badgeCount! > 0
                        ? Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: theme.colorScheme.error,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              item.badgeCount.toString(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          )
                        : null,
                    selected: item.isActive,
                    onTap: item.onTap,
                  );
                },
              ),
            ),
            const Divider(height: 1),
            ListTile(
              leading: Icon(Icons.logout, color: theme.colorScheme.error),
              title: Text(
                'Logout',
                style: TextStyle(color: theme.colorScheme.error),
              ),
              onTap: onLogout,
            ),
          ],
        ),
      ),
    );
  }
}

class DrawerItem {
  final IconData icon;
  final String title;
  final VoidCallback? onTap;
  final bool isActive;
  final int? badgeCount;

  const DrawerItem({
    required this.icon,
    required this.title,
    this.onTap,
    this.isActive = false,
    this.badgeCount,
  });
}
