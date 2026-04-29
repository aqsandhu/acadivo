// lib/models/homework_model.dart
import 'package:equatable/equatable.dart';

class HomeworkModel extends Equatable {
  final String id;
  final String title;
  final String? description;
  final String? classId;
  final String? className;
  final String? sectionId;
  final String? sectionName;
  final String? subjectId;
  final String? subjectName;
  final String? teacherId;
  final String? teacherName;
  final DateTime? dueDate;
  final DateTime? assignedDate;
  final List<String>? attachmentUrls;
  final bool isActive;
  final DateTime? createdAt;

  const HomeworkModel({
    required this.id,
    required this.title,
    this.description,
    this.classId,
    this.className,
    this.sectionId,
    this.sectionName,
    this.subjectId,
    this.subjectName,
    this.teacherId,
    this.teacherName,
    this.dueDate,
    this.assignedDate,
    this.attachmentUrls,
    this.isActive = true,
    this.createdAt,
  });

  factory HomeworkModel.fromJson(Map<String, dynamic> json) {
    return HomeworkModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      classId: json['classId']?.toString() ?? json['class_id']?.toString(),
      className: json['className']?.toString() ?? json['class_name']?.toString(),
      sectionId: json['sectionId']?.toString() ?? json['section_id']?.toString(),
      sectionName: json['sectionName']?.toString() ?? json['section_name']?.toString(),
      subjectId: json['subjectId']?.toString() ?? json['subject_id']?.toString(),
      subjectName: json['subjectName']?.toString() ?? json['subject_name']?.toString(),
      teacherId: json['teacherId']?.toString() ?? json['teacher_id']?.toString(),
      teacherName: json['teacherName']?.toString() ?? json['teacher_name']?.toString(),
      dueDate: json['dueDate'] != null || json['due_date'] != null
          ? DateTime.tryParse((json['dueDate'] ?? json['due_date']).toString())
          : null,
      assignedDate: json['assignedDate'] != null || json['assigned_date'] != null
          ? DateTime.tryParse((json['assignedDate'] ?? json['assigned_date']).toString())
          : null,
      attachmentUrls: json['attachmentUrls'] != null
          ? (json['attachmentUrls'] as List).map((e) => e.toString()).toList()
          : json['attachments'] != null
              ? (json['attachments'] as List).map((e) => e.toString()).toList()
              : null,
      isActive: json['isActive'] ?? json['is_active'] ?? true,
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.tryParse((json['createdAt'] ?? json['created_at']).toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'classId': classId,
      'className': className,
      'sectionId': sectionId,
      'sectionName': sectionName,
      'subjectId': subjectId,
      'subjectName': subjectName,
      'teacherId': teacherId,
      'teacherName': teacherName,
      'dueDate': dueDate?.toIso8601String(),
      'assignedDate': assignedDate?.toIso8601String(),
      'attachmentUrls': attachmentUrls,
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  HomeworkModel copyWith({
    String? id,
    String? title,
    String? description,
    String? classId,
    String? className,
    String? sectionId,
    String? sectionName,
    String? subjectId,
    String? subjectName,
    String? teacherId,
    String? teacherName,
    DateTime? dueDate,
    DateTime? assignedDate,
    List<String>? attachmentUrls,
    bool? isActive,
    DateTime? createdAt,
  }) {
    return HomeworkModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      classId: classId ?? this.classId,
      className: className ?? this.className,
      sectionId: sectionId ?? this.sectionId,
      sectionName: sectionName ?? this.sectionName,
      subjectId: subjectId ?? this.subjectId,
      subjectName: subjectName ?? this.subjectName,
      teacherId: teacherId ?? this.teacherId,
      teacherName: teacherName ?? this.teacherName,
      dueDate: dueDate ?? this.dueDate,
      assignedDate: assignedDate ?? this.assignedDate,
      attachmentUrls: attachmentUrls ?? this.attachmentUrls,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  List<Object?> get props => [id, title, classId, sectionId, subjectId, dueDate];
}
