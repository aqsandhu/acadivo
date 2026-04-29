// lib/models/class_model.dart
import 'package:equatable/equatable.dart';

class ClassModel extends Equatable {
  final String id;
  final String name;
  final String? displayName;
  final int? gradeLevel;
  final String? schoolId;
  final bool isActive;
  final DateTime? createdAt;
  final int? totalStudents;
  final int? totalSections;
  final String? teacherId;
  final String? teacherName;

  const ClassModel({
    required this.id,
    required this.name,
    this.displayName,
    this.gradeLevel,
    this.schoolId,
    this.isActive = true,
    this.createdAt,
    this.totalStudents,
    this.totalSections,
    this.teacherId,
    this.teacherName,
  });

  factory ClassModel.fromJson(Map<String, dynamic> json) {
    return ClassModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      displayName: json['displayName']?.toString() ?? json['display_name']?.toString(),
      gradeLevel: json['gradeLevel'] ?? json['grade_level'],
      schoolId: json['schoolId']?.toString() ?? json['school_id']?.toString(),
      isActive: json['isActive'] ?? json['is_active'] ?? true,
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.tryParse((json['createdAt'] ?? json['created_at']).toString())
          : null,
      totalStudents: json['totalStudents'] ?? json['total_students'],
      totalSections: json['totalSections'] ?? json['total_sections'],
      teacherId: json['teacherId']?.toString() ?? json['teacher_id']?.toString(),
      teacherName: json['teacherName']?.toString() ?? json['teacher_name']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'displayName': displayName,
      'gradeLevel': gradeLevel,
      'schoolId': schoolId,
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
      'totalStudents': totalStudents,
      'totalSections': totalSections,
      'teacherId': teacherId,
      'teacherName': teacherName,
    };
  }

  ClassModel copyWith({
    String? id,
    String? name,
    String? displayName,
    int? gradeLevel,
    String? schoolId,
    bool? isActive,
    DateTime? createdAt,
    int? totalStudents,
    int? totalSections,
    String? teacherId,
    String? teacherName,
  }) {
    return ClassModel(
      id: id ?? this.id,
      name: name ?? this.name,
      displayName: displayName ?? this.displayName,
      gradeLevel: gradeLevel ?? this.gradeLevel,
      schoolId: schoolId ?? this.schoolId,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      totalStudents: totalStudents ?? this.totalStudents,
      totalSections: totalSections ?? this.totalSections,
      teacherId: teacherId ?? this.teacherId,
      teacherName: teacherName ?? this.teacherName,
    );
  }

  @override
  List<Object?> get props => [id, name, schoolId, isActive];
}
