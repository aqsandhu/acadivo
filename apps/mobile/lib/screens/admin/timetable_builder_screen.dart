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
import '../../models/timetable_entry_model.dart';

class TimetableBuilderScreen extends ConsumerStatefulWidget {
  const TimetableBuilderScreen({super.key});
  @override
  ConsumerState<TimetableBuilderScreen> createState() => _TimetableBuilderScreenState();
}

class _TimetableBuilderScreenState extends ConsumerState<TimetableBuilderScreen> {
  bool _isLoading = true;
  String? _error;
  List<TimetableEntryModel> _entries = [];
  String _selectedClassId = '';
  String _selectedSectionId = '';

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      await _loadTimetable();
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  Future<void> _loadTimetable() async {
    if (_selectedClassId.isEmpty || _selectedSectionId.isEmpty) {
      setState(() { _entries = []; _isLoading = false; });
      return;
    }
    try {
      final api = ref.read(apiServiceProvider);
      final service = AdminService(api);
      final data = await service.getTimetable(_selectedClassId, _selectedSectionId);
      setState(() { _entries = data; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  Future<void> _saveEntry(TimetableEntryModel entry) async {
    try {
      final api = ref.read(apiServiceProvider);
      final service = AdminService(api);
      await service.createTimetableEntry(entry.toJson());
      await _loadTimetable();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ref.read(isRtlProvider) ? 'ٹیبل محفوظ ہو گیا' : 'Timetable entry saved')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
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
          title: isUrdu ? 'ٹائم ٹیبل بنائیں' : 'Timetable Builder',
          isUrdu: isUrdu,
        ),
        body: _isLoading
            ? const Center(child: LoadingWidget())
            : RefreshIndicator(
                onRefresh: _loadData,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isUrdu ? 'ہفتے کا شیڈول' : 'Weekly Schedule',
                        style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 16),
                      ...['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((day) => Card(
                        elevation: 0,
                        margin: const EdgeInsets.only(bottom: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: theme.colorScheme.secondaryContainer,
                            child: Text(day.substring(0,2), style: TextStyle(color: theme.colorScheme.secondary)),
                          ),
                          title: Text(day, style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                          subtitle: Text(isUrdu ? 'پیریڈز شامل کریں' : 'Add periods'),
                          trailing: const Icon(Icons.add),
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
