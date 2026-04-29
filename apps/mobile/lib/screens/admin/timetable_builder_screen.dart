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

class TimetableBuilderScreen extends ConsumerStatefulWidget {
  const TimetableBuilderScreen({super.key});
  @override
  ConsumerState<TimetableBuilderScreen> createState() => _TimetableBuilderScreenState();
}

class _TimetableBuilderScreenState extends ConsumerState<TimetableBuilderScreen> {
  bool _isLoading = true;
  String? _error;
  List<Map<String, dynamic>> _entries = [];

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      // Timetable data would come from admin API
      setState(() { _entries = []; _isLoading = false; });
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
