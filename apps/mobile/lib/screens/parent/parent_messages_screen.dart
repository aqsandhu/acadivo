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

import '../../services/communication_service.dart';
import '../../services/api_service.dart';
import '../../models/message_model.dart';

class ParentMessagesScreen extends ConsumerStatefulWidget {
  const ParentMessagesScreen({super.key});
  @override
  ConsumerState<ParentMessagesScreen> createState() => _ParentMessagesScreenState();
}

class _ParentMessagesScreenState extends ConsumerState<ParentMessagesScreen> {
  bool _isLoading = true;
  String? _error;
  List<ConversationModel> _conversations = [];

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = CommunicationService(api);
      final data = await service.getConversations();
      setState(() { _conversations = data; _isLoading = false; });
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
          title: isUrdu ? 'پیغامات' : 'Messages',
          isUrdu: isUrdu,
        ),
        body: _isLoading && _conversations.isEmpty
            ? const Center(child: LoadingWidget())
            : _error != null && _conversations.isEmpty
                ? AppErrorWidget(message: _error!, onRetry: _loadData)
                : _conversations.isEmpty
                    ? EmptyStateWidget(
                        icon: Icons.message_outlined,
                        title: isUrdu ? 'کوئی پیغام نہیں' : 'No Messages',
                        subtitle: isUrdu ? 'ابھی تک کوئی گفتگو نہیں' : 'No conversations yet.',
                      )
                    : RefreshIndicator(
                        onRefresh: _loadData,
                        child: ListView.builder(
                          itemCount: _conversations.length,
                          padding: const EdgeInsets.all(16),
                          itemBuilder: (context, index) {
                            final c = _conversations[index];
                            return Card(
                              elevation: 0,
                              margin: const EdgeInsets.only(bottom: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              child: ListTile(
                                leading: UserAvatar(name: c.participantName ?? 'User', size: 40),
                                title: Text(c.participantName ?? 'Unknown', style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                                subtitle: Text(c.lastMessage ?? '', maxLines: 1, overflow: TextOverflow.ellipsis),
                                trailing: c.unreadCount > 0
                                  ? CircleAvatar(radius: 10, backgroundColor: theme.colorScheme.primary, child: Text('${c.unreadCount}', style: const TextStyle(fontSize: 10, color: Colors.white)))
                                  : null,
                                onTap: () => context.push('/messages/${c.participantId ?? ""}'),
                              ),
                            );
                          },
                        ),
                      ),
      ),
    );
  }
}
