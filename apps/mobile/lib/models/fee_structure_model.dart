// lib/models/fee_structure_model.dart
import 'package:equatable/equatable.dart';

enum FeeFrequency { monthly, quarterly, yearly, oneTime, admission, exam, other }

class FeeStructureModel extends Equatable {
  final String id;
  final String name;
  final String? description;
  final String? classId;
  final String? className;
  final FeeFrequency frequency;
  final double amount;
  final String? currency;
  final DateTime? dueDay;
  final bool isMandatory;
  final bool isActive;
  final DateTime? createdAt;

  const FeeStructureModel({
    required this.id,
    required this.name,
    this.description,
    this.classId,
    this.className,
    this.frequency = FeeFrequency.monthly,
    required this.amount,
    this.currency,
    this.dueDay,
    this.isMandatory = true,
    this.isActive = true,
    this.createdAt,
  });

  factory FeeStructureModel.fromJson(Map<String, dynamic> json) {
    return FeeStructureModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString(),
      classId: json['classId']?.toString() ?? json['class_id']?.toString(),
      className: json['className']?.toString() ?? json['class_name']?.toString(),
      frequency: _parseFrequency(json['frequency']?.toString()),
      amount: _parseDouble(json['amount']),
      currency: json['currency']?.toString() ?? 'PKR',
      dueDay: json['dueDay'] != null || json['due_day'] != null
          ? DateTime.tryParse((json['dueDay'] ?? json['due_day']).toString())
          : null,
      isMandatory: json['isMandatory'] ?? json['is_mandatory'] ?? true,
      isActive: json['isActive'] ?? json['is_active'] ?? true,
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.tryParse((json['createdAt'] ?? json['created_at']).toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'classId': classId,
      'className': className,
      'frequency': frequency.name,
      'amount': amount,
      'currency': currency,
      'dueDay': dueDay?.toIso8601String(),
      'isMandatory': isMandatory,
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  FeeStructureModel copyWith({
    String? id,
    String? name,
    String? description,
    String? classId,
    String? className,
    FeeFrequency? frequency,
    double? amount,
    String? currency,
    DateTime? dueDay,
    bool? isMandatory,
    bool? isActive,
    DateTime? createdAt,
  }) {
    return FeeStructureModel(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      classId: classId ?? this.classId,
      className: className ?? this.className,
      frequency: frequency ?? this.frequency,
      amount: amount ?? this.amount,
      currency: currency ?? this.currency,
      dueDay: dueDay ?? this.dueDay,
      isMandatory: isMandatory ?? this.isMandatory,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  static FeeFrequency _parseFrequency(String? value) {
    switch (value?.toLowerCase()) {
      case 'quarterly':
        return FeeFrequency.quarterly;
      case 'yearly':
        return FeeFrequency.yearly;
      case 'one_time':
      case 'onetime':
        return FeeFrequency.oneTime;
      case 'admission':
        return FeeFrequency.admission;
      case 'exam':
        return FeeFrequency.exam;
      case 'other':
        return FeeFrequency.other;
      default:
        return FeeFrequency.monthly;
    }
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  @override
  List<Object?> get props => [id, name, classId, frequency, amount];
}
