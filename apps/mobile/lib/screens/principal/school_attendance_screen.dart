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

import '../../services/principal_service.dart';
import '../../services/api_service.dart';
import '../../models/attendance_model.dart';

class SchoolAttendanceScreen extends ConsumerStatefulWidget {
  const SchoolAttendanceScreen({super.key});
  @override
  ConsumerState<SchoolAttendanceScreen> createState() => _SchoolAttendanceScreenState();
}

class _SchoolAttendanceScreenState extends ConsumerState<SchoolAttendanceScreen> {
  bool _isLoading = true;
  String? _error;
  DateTime _selectedDate = DateTime.now();
  Map<String, dynamic> _overview = {};

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = PrincipalService(api);
      final data = await service.getAttendanceOverview(date: _selectedDate);
      setState(() { _overview = data; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  Future<void> _pickDate() async {
    final date = await showDatePicker(context: context, initialDate: _selectedDate, firstDate: DateTime(2020), lastDate: DateTime.now());
    if (date != null) { setState(() => _selectedDate = date); _loadData(); }
  }

  @override
  Widget build(BuildContext context) {
    final isUrdu = ref.watch(isRtlProvider);
    final theme = Theme.of(context);
    final present = _overview['present'] ?? 0;
    final absent = _overview['absent'] ?? 0;
    final late = _overview['late'] ?? 0;
    final total = _overview['total'] ?? 1;
    final percentage = total > 0 ? ((present / total) * 100).toStringAsFixed(1) : '0.0';
    return Directionality(
      textDirection: isUrdu ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: CustomAppBar(
          title: isUrdu ? 'اسکول کی حاضری' : 'School Attendance',
          isUrdu: isUrdu,
        ),
        body: _isLoading && _overview.isEmpty
            ? const Center(child: LoadingWidget())
            : _error != null && _overview.isEmpty
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
                          GridView.count(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            crossAxisCount: MediaQuery.of(context).size.width > 600 ? 4 : 2,
                            childAspectRatio: 1.2,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                            children: [
                              StatsCard(icon: Icons.event_available, value: '$present', label: isUrdu ? 'حاضر' : 'Present', color: const Color(0xFF10B981)),
                              StatsCard(icon: Icons.person_off, value: '$absent', label: isUrdu ? 'غیر حاضر' : 'Absent', color: const Color(0xFFEF4444)),
                              StatsCard(icon: Icons.access_time, value: '$late', label: isUrdu ? 'تاخیر' : 'Late', color: const Color(0xFFF59E0B)),
                              StatsCard(icon: Icons.percent, value: '$percentage%', label: isUrdu ? 'حاضری%' : 'Attendance%', color: const Color(0xFF3B82F6)),
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
