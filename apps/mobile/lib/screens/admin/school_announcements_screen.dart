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
import '../../models/announcement_model.dart';

class SchoolAnnouncementsScreen extends ConsumerStatefulWidget {
  const SchoolAnnouncementsScreen({super.key});
  @override
  ConsumerState<SchoolAnnouncementsScreen> createState() => _SchoolAnnouncementsScreenState();
}

class _SchoolAnnouncementsScreenState extends ConsumerState<SchoolAnnouncementsScreen> {
  bool _isLoading = true;
  String? _error;
  List<AnnouncementModel> _announcements = [];

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = AdminService(api);
      final data = await service.getAnnouncements();
      setState(() { _announcements = data; _isLoading = false; });
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
          title: isUrdu ? 'اسکول کے اعلانات' : 'School Announcements',
          isUrdu: isUrdu,
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: () {},
          child: const Icon(Icons.add),
        ),
        body: _isLoading && _announcements.isEmpty
            ? const Center(child: LoadingWidget())
            : _error != null && _announcements.isEmpty
                ? AppErrorWidget(message: _error!, onRetry: _loadData)
                : _announcements.isEmpty
                    ? EmptyStateWidget(
                        icon: Icons.campaign_outlined,
                        title: isUrdu ? 'کوئی اعلان نہیں' : 'No Announcements',
                        subtitle: isUrdu ? 'ابھی تک کوئی اعلان نہیں' : 'No announcements yet.',
                      )
                    : RefreshIndicator(
                        onRefresh: _loadData,
                        child: ListView.builder(
                          itemCount: _announcements.length,
                          padding: const EdgeInsets.all(16),
                          itemBuilder: (context, index) {
                            final a = _announcements[index];
                            return Card(
                              elevation: 0,
                              margin: const EdgeInsets.only(bottom: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        if (a.isPinned)
                                          StatusBadge(label: isUrdu ? 'پن شدہ' : 'Pinned', type: StatusType.info),
                                        const Spacer(),
                                        Text(
                                          a.postedAt != null
                                            ? '${a.postedAt!.day}/${a.postedAt!.month}/${a.postedAt!.year}'
                                            : '',
                                          style: theme.textTheme.bodySmall,
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Text(a.title, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                                    const SizedBox(height: 4),
                                    Text(a.content, style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
      ),
    );
  }
}
