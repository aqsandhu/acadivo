// lib/models/mark_model.dart
import 'package:equatable/equatable.dart';

class MarkModel extends Equatable {
  final String id;
  final String studentId;
  final String? studentName;
  final String subjectId;
  final String? subjectName;
  final String examType;
  final String? examName;
  final double marksObtained;
  final double totalMarks;
  final double? percentage;
  final String? grade;
  final String? remarks;
  final String? classId;
  final String? sectionId;
  final String? teacherId;
  final String? teacherName;
  final DateTime? examDate;
  final DateTime? createdAt;

  const MarkModel({
    required this.id,
    required this.studentId,
    this.studentName,
    required this.subjectId,
    this.subjectName,
    required this.examType,
    this.examName,
    required this.marksObtained,
    required this.totalMarks,
    this.percentage,
    this.grade,
    this.remarks,
    this.classId,
    this.sectionId,
    this.teacherId,
    this.teacherName,
    this.examDate,
    this.createdAt,
  });

  factory MarkModel.fromJson(Map<String, dynamic> json) {
    return MarkModel(
      id: json['id']?.toString() ?? '',
      studentId: json['studentId']?.toString() ?? json['student_id']?.toString() ?? '',
      studentName: json['studentName']?.toString() ?? json['student_name']?.toString(),
      subjectId: json['subjectId']?.toString() ?? json['subject_id']?.toString() ?? '',
      subjectName: json['subjectName']?.toString() ?? json['subject_name']?.toString(),
      examType: json['examType']?.toString() ?? json['exam_type']?.toString() ?? '',
      examName: json['examName']?.toString() ?? json['exam_name']?.toString(),
      marksObtained: _parseDouble(json['marksObtained'] ?? json['marks_obtained']),
      totalMarks: _parseDouble(json['totalMarks'] ?? json['total_marks']),
      percentage: json['percentage'] != null ? _parseDouble(json['percentage']) : null,
      grade: json['grade']?.toString(),
      remarks: json['remarks']?.toString(),
      classId: json['classId']?.toString() ?? json['class_id']?.toString(),
      sectionId: json['sectionId']?.toString() ?? json['section_id']?.toString(),
      teacherId: json['teacherId']?.toString() ?? json['teacher_id']?.toString(),
      teacherName: json['teacherName']?.toString() ?? json['teacher_name']?.toString(),
      examDate: json['examDate'] != null || json['exam_date'] != null
          ? DateTime.tryParse((json['examDate'] ?? json['exam_date']).toString())
          : null,
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.tryParse((json['createdAt'] ?? json['created_at']).toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'studentId': studentId,
      'studentName': studentName,
      'subjectId': subjectId,
      'subjectName': subjectName,
      'examType': examType,
      'examName': examName,
      'marksObtained': marksObtained,
      'totalMarks': totalMarks,
      'percentage': percentage,
      'grade': grade,
      'remarks': remarks,
      'classId': classId,
      'sectionId': sectionId,
      'teacherId': teacherId,
      'teacherName': teacherName,
      'examDate': examDate?.toIso8601String(),
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  MarkModel copyWith({
    String? id,
    String? studentId,
    String? studentName,
    String? subjectId,
    String? subjectName,
    String? examType,
    String? examName,
    double? marksObtained,
    double? totalMarks,
    double? percentage,
    String? grade,
    String? remarks,
    String? classId,
    String? sectionId,
    String? teacherId,
    String? teacherName,
    DateTime? examDate,
    DateTime? createdAt,
  }) {
    return MarkModel(
      id: id ?? this.id,
      studentId: studentId ?? this.studentId,
      studentName: studentName ?? this.studentName,
      subjectId: subjectId ?? this.subjectId,
      subjectName: subjectName ?? this.subjectName,
      examType: examType ?? this.examType,
      examName: examName ?? this.examName,
      marksObtained: marksObtained ?? this.marksObtained,
      totalMarks: totalMarks ?? this.totalMarks,
      percentage: percentage ?? this.percentage,
      grade: grade ?? this.grade,
      remarks: remarks ?? this.remarks,
      classId: classId ?? this.classId,
      sectionId: sectionId ?? this.sectionId,
      teacherId: teacherId ?? this.teacherId,
      teacherName: teacherName ?? this.teacherName,
      examDate: examDate ?? this.examDate,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  @override
  List<Object?> get props => [id, studentId, subjectId, examType, marksObtained, totalMarks];
}
