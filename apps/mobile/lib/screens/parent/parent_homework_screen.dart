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
import '../../models/homework_model.dart';
import '../../models/student_model.dart';

class ParentHomeworkScreen extends ConsumerStatefulWidget {
  const ParentHomeworkScreen({super.key});
  @override
  ConsumerState<ParentHomeworkScreen> createState() => _ParentHomeworkScreenState();
}

class _ParentHomeworkScreenState extends ConsumerState<ParentHomeworkScreen> {
  bool _isLoading = true;
  String? _error;
  List<StudentModel> _children = [];
  List<HomeworkModel> _homework = [];
  String? _selectedChildId;

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = ParentService(api);
      final children = await service.getMyChildren();
      setState(() { _children = children; _isLoading = false; });
      if (children.isNotEmpty) {
        _selectedChildId = children.first.id;
        _loadChildHomework(children.first.id);
      }
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  Future<void> _loadChildHomework(String childId) async {
    setState(() => _isLoading = true);
    try {
      final api = ref.read(apiServiceProvider);
      final service = ParentService(api);
      final data = await service.getChildHomework(childId);
      setState(() { _homework = data; _isLoading = false; });
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
          title: isUrdu ? 'ہوم ورک' : 'Homework',
          isUrdu: isUrdu,
        ),
        body: _isLoading && _children.isEmpty
            ? const Center(child: LoadingWidget())
            : _error != null && _children.isEmpty
                ? AppErrorWidget(message: _error!, onRetry: _loadData)
                : Column(
                    children: [
                      if (_children.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: DropdownButtonFormField<String>(
                            value: _selectedChildId,
                            decoration: InputDecoration(
                              labelText: isUrdu ? 'بچہ منتخب کریں' : 'Select Child',
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            items: _children.map((c) => DropdownMenuItem(value: c.id, child: Text(c.name))).toList(),
                            onChanged: (val) { if (val != null) { setState(() => _selectedChildId = val); _loadChildHomework(val); } },
                          ),
                        ),
                      Expanded(
                        child: _homework.isEmpty
                          ? EmptyStateWidget(
                              icon: Icons.assignment_outlined,
                              title: isUrdu ? 'کوئی ہوم ورک نہیں' : 'No Homework',
                              subtitle: isUrdu ? 'اس بچے کے لیے کوئی ہوم ورک نہیں' : 'No homework for this child.',
                            )
                          : RefreshIndicator(
                              onRefresh: () => _loadChildHomework(_selectedChildId!),
                              child: ListView.builder(
                                itemCount: _homework.length,
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                itemBuilder: (context, index) {
                                  final h = _homework[index];
                                  return Card(
                                    elevation: 0,
                                    margin: const EdgeInsets.only(bottom: 8),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    child: ListTile(
                                      leading: CircleAvatar(backgroundColor: theme.colorScheme.secondaryContainer, child: Icon(Icons.assignment, color: theme.colorScheme.secondary, size: 18)),
                                      title: Text(h.title, style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                                      subtitle: Text('${h.subjectName ?? ""} • Due: ${h.dueDate != null ? "${h.dueDate!.day}/${h.dueDate!.month}" : "N/A"}'),
                                      trailing: StatusBadge(label: h.status, type: false ? StatusType.success : StatusType.warning),
                                    ),
                                  );
                                },
                              ),
                            ),
                      ),
                    ],
                  ),
      ),
    );
  }
}
