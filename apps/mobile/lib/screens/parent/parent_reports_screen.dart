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
import '../../models/report_request_model.dart';
import '../../models/student_model.dart';

class ParentReportsScreen extends ConsumerStatefulWidget {
  const ParentReportsScreen({super.key});
  @override
  ConsumerState<ParentReportsScreen> createState() => _ParentReportsScreenState();
}

class _ParentReportsScreenState extends ConsumerState<ParentReportsScreen> {
  bool _isLoading = true;
  String? _error;
  List<ReportRequestModel> _reports = [];
  List<StudentModel> _children = [];
  String? _selectedChildId;

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = ParentService(api);
      final children = await service.getMyChildren();
      final reports = await service.getMyReports();
      setState(() { _children = children; _reports = reports; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  Future<void> _requestReport() async {
    final isUrdu = ref.read(isRtlProvider);
    if (_selectedChildId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(isUrdu ? 'براہ کرم بچہ منتخب کریں' : 'Please select a child')),
      );
      return;
    }
    setState(() => _isLoading = true);
    try {
      final api = ref.read(apiServiceProvider);
      final service = ParentService(api);
      await service.requestReport({
        'studentId': _selectedChildId,
        'type': 'progress',
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(isUrdu ? 'رپورٹ کی درخواست بھیج دی گئی' : 'Report request submitted')),
        );
      }
      _loadData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
      setState(() => _isLoading = false);
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
          title: isUrdu ? 'رپورٹس' : 'Reports',
          isUrdu: isUrdu,
        ),
        body: _isLoading && _reports.isEmpty
            ? const Center(child: LoadingWidget())
            : _error != null && _reports.isEmpty
                ? AppErrorWidget(message: _error!, onRetry: _loadData)
                : RefreshIndicator(
                    onRefresh: _loadData,
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (_children.isNotEmpty)
                            DropdownButtonFormField<String>(
                              value: _selectedChildId,
                              decoration: InputDecoration(
                                labelText: isUrdu ? 'بچہ منتخب کریں' : 'Select Child',
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              items: _children.map((c) => DropdownMenuItem(value: c.id, child: Text(c.name))).toList(),
                              onChanged: (val) => setState(() => _selectedChildId = val),
                            ),
                          const SizedBox(height: 16),
                          SizedBox(
                            width: double.infinity,
                            height: 48,
                            child: ElevatedButton(
                              onPressed: _isLoading ? null : _requestReport,
                              child: Text(isUrdu ? 'رپورٹ کی درخواست کریں' : 'Request Report'),
                            ),
                          ),
                          const SizedBox(height: 24),
                          Text(isUrdu ? 'میری رپورٹس' : 'My Reports', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 12),
                          ..._reports.map((r) => Card(
                            elevation: 0,
                            margin: const EdgeInsets.only(bottom: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: ListTile(
                              leading: Icon(Icons.description_outlined, color: theme.colorScheme.primary),
                              title: Text(r.type ?? 'Report', style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                              subtitle: Text(r.status ?? 'Pending'),
                              trailing: StatusBadge(
                                label: r.status ?? 'Pending',
                                type: (r.status == 'completed') ? StatusType.success : StatusType.warning,
                              ),
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
