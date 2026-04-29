import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../../providers/locale_provider.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/stats_card.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/user_avatar.dart';
import '../../routing/route_names.dart';

import '../../services/parent_service.dart';
import '../../services/api_service.dart';
import '../../models/student_model.dart';

class ParentDashboardScreen extends ConsumerStatefulWidget {
  const ParentDashboardScreen({super.key});
  @override
  ConsumerState<ParentDashboardScreen> createState() => _ParentDashboardScreenState();
}

class _ParentDashboardScreenState extends ConsumerState<ParentDashboardScreen> {
  bool _isLoading = true;
  String? _error;
  List<StudentModel> _children = [];

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = ParentService(api);
      final data = await service.getMyChildren();
      setState(() { _children = data; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isUrdu = ref.watch(isRtlProvider);
    final theme = Theme.of(context);
    return Directionality(
      textDirection: isUrdu ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: CustomAppBar(
          title: isUrdu ? 'والدین کا ڈیش بورڈ' : 'Parent Dashboard',
          actions: [
            IconButton(icon: const Icon(Icons.notifications_outlined), onPressed: () => context.push(RouteNames.notifications)),
          ],
          isUrdu: isUrdu,
        ),
        body: _isLoading && _children.isEmpty
            ? const Center(child: LoadingWidget())
            : _error != null && _children.isEmpty
                ? AppErrorWidget(message: _error!, onRetry: _loadData)
                : RefreshIndicator(
                    onRefresh: _loadData,
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(isUrdu ? 'میرے بچے' : 'My Children', style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 16),
                          ..._children.map((child) => Card(
                            elevation: 0,
                            margin: const EdgeInsets.only(bottom: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(16),
                              onTap: () => context.push('/parent/child/${child.id}'),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Row(
                                  children: [
                                    UserAvatar(name: child.name, size: 50),
                                    const SizedBox(width: 16),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(child.name, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                                          const SizedBox(height: 4),
                                          Text('${child.className ?? ""} • ${child.sectionName ?? ""}', style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
                                          const SizedBox(height: 4),
                                          Text('Roll: ${child.rollNumber ?? "N/A"}', style: theme.textTheme.bodySmall),
                                        ],
                                      ),
                                    ),
                                    const Icon(Icons.chevron_right),
                                  ],
                                ),
                              ),
                            ),
                          )),
                          const SizedBox(height: 24),
                          Text(isUrdu ? 'فوری کارروائیاں' : 'Quick Actions', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 12,
                            runSpacing: 12,
                            children: [
                              _ActionChip(icon: Icons.event_available, label: isUrdu ? 'حاضری' : 'Attendance', onTap: () => context.push(RouteNames.parentAttendance)),
                              _ActionChip(icon: Icons.payment, label: isUrdu ? 'فیس' : 'Fee', onTap: () => context.push(RouteNames.parentFee)),
                              _ActionChip(icon: Icons.assignment, label: isUrdu ? 'ہوم ورک' : 'Homework', onTap: () => context.push(RouteNames.parentHomework)),
                              _ActionChip(icon: Icons.school, label: isUrdu ? 'نتائج' : 'Results', onTap: () => context.push(RouteNames.parentResults)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
      ),
    );
  }
}

class _ActionChip extends StatelessWidget {
  final IconData icon; final String label; final VoidCallback onTap;
  const _ActionChip({required this.icon, required this.label, required this.onTap});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ActionChip(
      avatar: Icon(icon, size: 18, color: theme.colorScheme.primary),
      label: Text(label),
      backgroundColor: theme.colorScheme.primaryContainer.withOpacity(0.3),
      side: BorderSide.none,
      onPressed: onTap,
    );
  }
}
