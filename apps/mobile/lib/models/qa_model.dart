// lib/models/qa_model.dart
import 'package:equatable/equatable.dart';

class QaModel extends Equatable {
  final String id;
  final String question;
  final String? answer;
  final String askedBy;
  final String askedByName;
  final String? answeredBy;
  final String? answeredByName;
  final DateTime createdAt;
  final DateTime? answeredAt;
  final String status; // pending, answered, closed
  final String? category;
  final int? likes;

  const QaModel({
    required this.id,
    required this.question,
    this.answer,
    required this.askedBy,
    required this.askedByName,
    this.answeredBy,
    this.answeredByName,
    required this.createdAt,
    this.answeredAt,
    this.status = 'pending',
    this.category,
    this.likes,
  });

  factory QaModel.fromJson(Map<String, dynamic> json) {
    return QaModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      question: json['question']?.toString() ?? '',
      answer: json['answer']?.toString(),
      askedBy: json['askedBy']?.toString() ?? json['asked_by']?.toString() ?? '',
      askedByName: json['askedByName']?.toString() ?? json['asked_by_name']?.toString() ?? 'Unknown',
      answeredBy: json['answeredBy']?.toString() ?? json['answered_by']?.toString(),
      answeredByName: json['answeredByName']?.toString() ?? json['answered_by_name']?.toString(),
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.tryParse((json['createdAt'] ?? json['created_at']).toString()) ?? DateTime.now()
          : DateTime.now(),
      answeredAt: json['answeredAt'] != null || json['answered_at'] != null
          ? DateTime.tryParse((json['answeredAt'] ?? json['answered_at']).toString())
          : null,
      status: json['status']?.toString() ?? 'pending',
      category: json['category']?.toString(),
      likes: json['likes'] != null ? int.tryParse(json['likes'].toString()) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'question': question,
      'answer': answer,
      'askedBy': askedBy,
      'askedByName': askedByName,
      'answeredBy': answeredBy,
      'answeredByName': answeredByName,
      'createdAt': createdAt.toIso8601String(),
      'answeredAt': answeredAt?.toIso8601String(),
      'status': status,
      'category': category,
      'likes': likes,
    };
  }

  bool get isAnswered => answer != null && answer!.isNotEmpty && status == 'answered';
  bool get isPending => status == 'pending' || answer == null || answer!.isEmpty;

  QaModel copyWith({
    String? id,
    String? question,
    String? answer,
    String? askedBy,
    String? askedByName,
    String? answeredBy,
    String? answeredByName,
    DateTime? createdAt,
    DateTime? answeredAt,
    String? status,
    String? category,
    int? likes,
  }) {
    return QaModel(
      id: id ?? this.id,
      question: question ?? this.question,
      answer: answer ?? this.answer,
      askedBy: askedBy ?? this.askedBy,
      askedByName: askedByName ?? this.askedByName,
      answeredBy: answeredBy ?? this.answeredBy,
      answeredByName: answeredByName ?? this.answeredByName,
      createdAt: createdAt ?? this.createdAt,
      answeredAt: answeredAt ?? this.answeredAt,
      status: status ?? this.status,
      category: category ?? this.category,
      likes: likes ?? this.likes,
    );
  }

  @override
  List<Object?> get props => [id, question, answer, askedBy, status, createdAt];
}
