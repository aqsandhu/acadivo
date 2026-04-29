import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/user_avatar.dart';

class ParentChildrenScreen extends ConsumerStatefulWidget {
  const ParentChildrenScreen({super.key});

  @override
  ConsumerState<ParentChildrenScreen> createState() => _ParentChildrenScreenState();
}

class _ParentChildrenScreenState extends ConsumerState<ParentChildrenScreen> {
  bool _isUrdu = false;

  final List<Map<String, dynamic>> _children = [
    {
      'name': 'Ahmad Ali',
      'class': 'Class 8-A',
      'roll': 101,
      'attendanceStreak': 15,
      'latestGrade': 'A',
      'avatar': null,
    },
    {
      'name': 'Fatima Ali',
      'class': 'Class 5-B',
      'roll': 45,
      'attendanceStreak': 10,
      'latestGrade': 'B+',
      'avatar': null,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: CustomAppBar(
        title: _isUrdu ? 'میرے بچے' : 'My Children',
        isUrdu: _isUrdu,
      ),
      body: _children.isEmpty
          ? EmptyStateWidget(
              icon: Icons.family_restroom_outlined,
              title: _isUrdu ? 'کوئی بچے نہیں' : 'No Children',
              subtitle: _isUrdu ? 'آپ کے اکاؤنٹ سے کوئی بچے منسلک نہیں' : 'No children linked to your account',
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _children.length,
              itemBuilder: (context, index) {
                final child = _children[index];
                return Card(
                  elevation: 0,
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: theme.colorScheme.outlineVariant.withOpacity(0.5)),
                  ),
                  child: InkWell(
                    onTap: () {},
                    borderRadius: BorderRadius.circular(16),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              UserAvatar(
                                name: child['name'],
                                size: 56,
                                imageUrl: child['avatar'],
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      child['name'],
                                      style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                                    ),
                                    Text(
                                      '${child['class']} | Roll: ${child['roll']}',
                                      style: theme.textTheme.bodyMedium?.copyWith(
                                        color: theme.colorScheme.onSurfaceVariant,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              _buildMetric(
                                theme,
                                Icons.local_fire_department,
                                '${child['attendanceStreak']} days',
                                'Streak',
                                const Color(0xFFF59E0B),
                              ),
                              _buildMetric(
                                theme,
                                Icons.grade,
                                child['latestGrade'],
                                'Latest Grade',
                                const Color(0xFF10B981),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }

  Widget _buildMetric(ThemeData theme, IconData icon, String value, String label, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        margin: const EdgeInsets.symmetric(horizontal: 4),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 4),
            Text(
              value,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              label,
              style: theme.textTheme.labelSmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
