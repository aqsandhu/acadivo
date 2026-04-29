import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../../providers/locale_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/user_avatar.dart';
import '../../routing/route_names.dart';

import '../../services/communication_service.dart';
import '../../services/api_service.dart';
import '../../models/message_model.dart';

class ChatScreen extends ConsumerStatefulWidget {
  final String userId;
  const ChatScreen({super.key, required this.userId});
  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  bool _isLoading = true;
  String? _error;
  List<MessageModel> _messages = [];
  final TextEditingController _messageController = TextEditingController();
  bool _sending = false;

  @override
  void initState() { super.initState(); _loadData(); }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final api = ref.read(apiServiceProvider);
      final service = CommunicationService(api);
      final data = await service.getMessages(conversationId: widget.userId);
      setState(() { _messages = data; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  Future<void> _sendMessage() async {
    if (_messageController.text.trim().isEmpty) return;
    setState(() => _sending = true);
    try {
      final api = ref.read(apiServiceProvider);
      final service = CommunicationService(api);
      await service.sendMessage(
        receiverId: widget.userId,
        content: _messageController.text.trim(),
      );
      _messageController.clear();
      _loadData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _sending = false);
    }
  }

  @override
  void dispose() { _messageController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final isUrdu = ref.watch(isRtlProvider);
    final theme = Theme.of(context);
    return Directionality(
      textDirection: isUrdu ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        appBar: CustomAppBar(
          title: isUrdu ? 'گفتگو' : 'Chat',
          isUrdu: isUrdu,
        ),
        body: Column(
          children: [
            Expanded(
              child: _isLoading && _messages.isEmpty
                ? const Center(child: LoadingWidget())
                : _error != null && _messages.isEmpty
                  ? AppErrorWidget(message: _error!, onRetry: _loadData)
                  : _messages.isEmpty
                    ? EmptyStateWidget(
                        icon: Icons.chat_bubble_outline,
                        title: isUrdu ? 'کوئی پیغام نہیں' : 'No Messages',
                        subtitle: isUrdu ? 'گفتگو شروع کرنے کے لیے پیغام بھیجیں' : 'Send a message to start the conversation.',
                      )
                    : ListView.builder(
                        reverse: true,
                        padding: const EdgeInsets.all(16),
                        itemCount: _messages.length,
                        itemBuilder: (context, index) {
                          final msg = _messages[_messages.length - 1 - index];
                          final isMe = msg.senderId == ref.read(currentUserProvider)?.id;
                          return Align(
                            alignment: isMe ? (isUrdu ? Alignment.centerLeft : Alignment.centerRight) : (isUrdu ? Alignment.centerRight : Alignment.centerLeft),
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                              decoration: BoxDecoration(
                                color: isMe ? theme.colorScheme.primary : theme.colorScheme.surfaceContainerHighest,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Text(
                                msg.content,
                                style: TextStyle(color: isMe ? Colors.white : theme.colorScheme.onSurface),
                              ),
                            ),
                          );
                        },
                      ),
            ),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                border: Border(top: BorderSide(color: theme.colorScheme.outlineVariant)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: InputDecoration(
                        hintText: isUrdu ? 'پیغام لکھیں...' : 'Type a message...',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(24)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: _sending ? null : _sendMessage,
                    icon: _sending ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.send),
                    style: IconButton.styleFrom(
                      backgroundColor: theme.colorScheme.primary,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
