// lib/providers/qa_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/qa_model.dart';
import '../services/qa_service.dart';
import 'auth_provider.dart';

class QaNotifier extends StateNotifier<AsyncValue<List<QaModel>>> {
  final QaService _qaService;

  QaNotifier(this._qaService) : super(const AsyncValue.loading()) {
    loadQuestions();
  }

  Future<void> loadQuestions({String? status, String? category}) async {
    state = const AsyncValue.loading();
    try {
      final questions = await _qaService.getQuestions(status: status, category: category);
      state = AsyncValue.data(questions);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> askQuestion({required String question, String? category}) async {
    try {
      final newQuestion = await _qaService.askQuestion(question: question, category: category);
      if (newQuestion != null) {
        final current = state.valueOrNull ?? [];
        state = AsyncValue.data([newQuestion, ...current]);
        return true;
      }
      return false;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  Future<bool> answerQuestion({required String id, required String answer}) async {
    try {
      final updated = await _qaService.answerQuestion(id: id, answer: answer);
      if (updated != null) {
        final current = state.valueOrNull ?? [];
        final updatedList = current.map((q) => q.id == id ? updated : q).toList();
        state = AsyncValue.data(updatedList);
        return true;
      }
      return false;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }
}

final qaServiceProvider = Provider<QaService>((ref) {
  return QaService(ref.read(apiServiceProvider));
});

final qaProvider = StateNotifierProvider<QaNotifier, AsyncValue<List<QaModel>>>((ref) {
  return QaNotifier(ref.read(qaServiceProvider));
});
