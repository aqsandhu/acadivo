// lib/models/subject_model.dart
import 'package:equatable/equatable.dart';

class SubjectModel extends Equatable {
  final String id;
  final String name;
  final String? code;
  final String? description;
  final String? classId;
  final String? className;
  final String? teacherId;
  final String? teacherName;
  final int? creditHours;
  final bool isActive;
  final DateTime? createdAt;

  const SubjectModel({
    required this.id,
    required this.name,
    this.code,
    this.description,
    this.classId,
    this.className,
    this.teacherId,
    this.teacherName,
    this.creditHours,
    this.isActive = true,
    this.createdAt,
  });

  factory SubjectModel.fromJson(Map<String, dynamic> json) {
    return SubjectModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      code: json['code']?.toString(),
      description: json['description']?.toString(),
      classId: json['classId']?.toString() ?? json['class_id']?.toString(),
      className: json['className']?.toString() ?? json['class_name']?.toString(),
      teacherId: json['teacherId']?.toString() ?? json['teacher_id']?.toString(),
      teacherName: json['teacherName']?.toString() ?? json['teacher_name']?.toString(),
      creditHours: json['creditHours'] ?? json['credit_hours'],
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
      'code': code,
      'description': description,
      'classId': classId,
      'className': className,
      'teacherId': teacherId,
      'teacherName': teacherName,
      'creditHours': creditHours,
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  SubjectModel copyWith({
    String? id,
    String? name,
    String? code,
    String? description,
    String? classId,
    String? className,
    String? teacherId,
    String? teacherName,
    int? creditHours,
    bool? isActive,
    DateTime? createdAt,
  }) {
    return SubjectModel(
      id: id ?? this.id,
      name: name ?? this.name,
      code: code ?? this.code,
      description: description ?? this.description,
      classId: classId ?? this.classId,
      className: className ?? this.className,
      teacherId: teacherId ?? this.teacherId,
      teacherName: teacherName ?? this.teacherName,
      creditHours: creditHours ?? this.creditHours,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  List<Object?> get props => [id, name, code, classId, isActive];
}
