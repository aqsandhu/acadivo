import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../../providers/locale_provider.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/user_avatar.dart';
import '../../routing/route_names.dart';

import '../../services/teacher_service.dart';
import '../../services/api_service.dart';
import '../../models/timetable_entry_model.dart';

class TeacherTimetableScreen extends ConsumerStatefulWidget {
  const TeacherTimetableScreen({super.key});
  @override
  ConsumerState<TeacherTimetableScreen> createState() => _TeacherTimetableScreenState();
}

class _TeacherTimetableScreenState extends ConsumerState<TeacherTimetableScreen> {
  bool _isLoading = true;
  String? _error;
  List<TimetableEntryModel> _entries = [];

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = TeacherService(api);
      final data = await service.getTimetable();
      setState(() { _entries = data; _isLoading = false; });
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
          title: isUrdu ? 'ٹائم ٹیبل' : 'Timetable',
          isUrdu: isUrdu,
        ),
        body: _isLoading && _entries.isEmpty
            ? const Center(child: LoadingWidget())
            : _error != null && _entries.isEmpty
                ? AppErrorWidget(message: _error!, onRetry: _loadData)
                : _entries.isEmpty
                    ? EmptyStateWidget(
                        icon: Icons.schedule_outlined,
                        title: isUrdu ? 'کوئی ٹائم ٹیبل نہیں' : 'No Timetable',
                        subtitle: isUrdu ? 'آپ کا کوئی ٹائم ٹیبل مقرر نہیں' : 'No timetable assigned to you.',
                      )
                    : RefreshIndicator(
                        onRefresh: _loadData,
                        child: ListView.builder(
                          itemCount: _entries.length,
                          padding: const EdgeInsets.all(16),
                          itemBuilder: (context, index) {
                            final e = _entries[index];
                            return Card(
                              elevation: 0,
                              margin: const EdgeInsets.only(bottom: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: theme.colorScheme.primaryContainer,
                                  child: Text(e.day.name.substring(0,1), style: TextStyle(color: theme.colorScheme.primary)),
                                ),
                                title: Text(e.subjectName ?? e.subjectId, style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                                subtitle: Text('${e.className ?? ""} • ${e.startTime ?? ""} - ${e.endTime ?? ""}'),
                                trailing: Text(e.roomNumber ?? '', style: theme.textTheme.bodySmall),
                              ),
                            );
                          },
                        ),
                      ),
      ),
    );
  }
}
