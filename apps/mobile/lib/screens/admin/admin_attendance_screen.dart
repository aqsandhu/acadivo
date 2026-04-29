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

import '../../services/admin_service.dart';
import '../../services/api_service.dart';
import '../../models/class_model.dart';

class AdminAttendanceScreen extends ConsumerStatefulWidget {
  const AdminAttendanceScreen({super.key});
  @override
  ConsumerState<AdminAttendanceScreen> createState() => _AdminAttendanceScreenState();
}

class _AdminAttendanceScreenState extends ConsumerState<AdminAttendanceScreen> {
  bool _isLoading = true;
  String? _error;
  DateTime _selectedDate = DateTime.now();
  List<ClassModel> _classes = [];
  Map<String, dynamic> _report = {};

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = AdminService(api);
      final classes = await service.getClasses();
      setState(() { _classes = classes; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  Future<void> _pickDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );
    if (date != null) setState(() => _selectedDate = date);
  }

  @override
  Widget build(BuildContext context) {
    final isUrdu = ref.watch(isRtlProvider);
    final theme = Theme.of(context);
    return Directionality(
      textDirection: isUrdu ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: CustomAppBar(
          title: isUrdu ? 'حاضری کا نظم' : 'Attendance Management',
          isUrdu: isUrdu,
        ),
        body: _isLoading && _classes.isEmpty
            ? const Center(child: LoadingWidget())
            : _error != null && _classes.isEmpty
                ? AppErrorWidget(message: _error!, onRetry: _loadData)
                : RefreshIndicator(
                    onRefresh: _loadData,
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          ListTile(
                            leading: const Icon(Icons.calendar_today),
                            title: Text(isUrdu ? 'تاریخ منتخب کریں' : 'Select Date'),
                            subtitle: Text('${_selectedDate.toLocal()}'.split(' ')[0]),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: _pickDate,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            isUrdu ? 'کلاسز' : 'Classes',
                            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 8),
                          ..._classes.map((c) => Card(
                            elevation: 0,
                            margin: const EdgeInsets.only(bottom: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: theme.colorScheme.primaryContainer,
                                child: Icon(Icons.class_, color: theme.colorScheme.primary, size: 18),
                              ),
                              title: Text(c.name, style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                              subtitle: Text(isUrdu ? 'حاضری دیکھیں' : 'View attendance'),
                              trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                            ),
                          )),
                        ],
                      ),
                    ),
                  ),
      ),
    );
  }
}
