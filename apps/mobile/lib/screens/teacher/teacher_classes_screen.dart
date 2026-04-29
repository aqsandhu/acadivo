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

import '../../services/teacher_service.dart';
import '../../services/api_service.dart';
import '../../models/student_model.dart';

class TeacherClassesScreen extends ConsumerStatefulWidget {
  const TeacherClassesScreen({super.key});
  @override
  ConsumerState<TeacherClassesScreen> createState() => _TeacherClassesScreenState();
}

class _TeacherClassesScreenState extends ConsumerState<TeacherClassesScreen> {
  bool _isLoading = true;
  String? _error;
  List<Map<String, dynamic>> _classes = [];

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = TeacherService(api);
      final data = await service.getMyClasses();
      setState(() { _classes = data; _isLoading = false; });
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
          title: isUrdu ? 'میری کلاسز' : 'My Classes',
          isUrdu: isUrdu,
        ),
        body: _isLoading && _classes.isEmpty
            ? const Center(child: LoadingWidget())
            : _error != null && _classes.isEmpty
                ? AppErrorWidget(message: _error!, onRetry: _loadData)
                : _classes.isEmpty
                    ? EmptyStateWidget(
                        icon: Icons.class_outlined,
                        title: isUrdu ? 'کوئی کلاس نہیں' : 'No Classes Found',
                        subtitle: isUrdu ? 'آپ کی کوئی کلاس مقرر نہیں' : 'No classes assigned to you.',
                      )
                    : RefreshIndicator(
                        onRefresh: _loadData,
                        child: ListView.builder(
                          itemCount: _classes.length,
                          padding: const EdgeInsets.all(16),
                          itemBuilder: (context, index) {
                            final c = _classes[index];
                            return Card(
                              elevation: 0,
                              margin: const EdgeInsets.only(bottom: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: theme.colorScheme.primaryContainer,
                                  child: Icon(Icons.class_, color: theme.colorScheme.primary, size: 20),
                                ),
                                title: Text(c['className'] ?? 'Class', style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                                subtitle: Text('${c['subject'] ?? ""} • ${c['sectionName'] ?? ""}'),
                                trailing: const Icon(Icons.chevron_right),
                              ),
                            );
                          },
                        ),
                      ),
      ),
    );
  }
}
