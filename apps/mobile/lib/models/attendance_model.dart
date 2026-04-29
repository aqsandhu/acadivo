// lib/models/attendance_model.dart
import 'package:equatable/equatable.dart';

enum AttendanceStatus { present, absent, late, leave, halfDay, excused }

class AttendanceModel extends Equatable {
  final String id;
  final String studentId;
  final String? studentName;
  final String classId;
  final String? className;
  final String sectionId;
  final String? sectionName;
  final DateTime date;
  final AttendanceStatus status;
  final String? remarks;
  final String? markedById;
  final String? markedByName;
  final DateTime? markedAt;
  final String? subjectId;
  final String? subjectName;
  final DateTime? createdAt;

  const AttendanceModel({
    required this.id,
    required this.studentId,
    this.studentName,
    required this.classId,
    this.className,
    required this.sectionId,
    this.sectionName,
    required this.date,
    this.status = AttendanceStatus.present,
    this.remarks,
    this.markedById,
    this.markedByName,
    this.markedAt,
    this.subjectId,
    this.subjectName,
    this.createdAt,
  });

  factory AttendanceModel.fromJson(Map<String, dynamic> json) {
    return AttendanceModel(
      id: json['id']?.toString() ?? '',
      studentId: json['studentId']?.toString() ?? json['student_id']?.toString() ?? '',
      studentName: json['studentName']?.toString() ?? json['student_name']?.toString(),
      classId: json['classId']?.toString() ?? json['class_id']?.toString() ?? '',
      className: json['className']?.toString() ?? json['class_name']?.toString(),
      sectionId: json['sectionId']?.toString() ?? json['section_id']?.toString() ?? '',
      sectionName: json['sectionName']?.toString() ?? json['section_name']?.toString(),
      date: _parseDate(json['date']),
      status: _parseStatus(json['status']?.toString()),
      remarks: json['remarks']?.toString(),
      markedById: json['markedById']?.toString() ?? json['marked_by_id']?.toString(),
      markedByName: json['markedByName']?.toString() ?? json['marked_by_name']?.toString(),
      markedAt: json['markedAt'] != null || json['marked_at'] != null
          ? DateTime.tryParse((json['markedAt'] ?? json['marked_at']).toString())
          : null,
      subjectId: json['subjectId']?.toString() ?? json['subject_id']?.toString(),
      subjectName: json['subjectName']?.toString() ?? json['subject_name']?.toString(),
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
      'classId': classId,
      'className': className,
      'sectionId': sectionId,
      'sectionName': sectionName,
      'date': date.toIso8601String(),
      'status': status.name,
      'remarks': remarks,
      'markedById': markedById,
      'markedByName': markedByName,
      'markedAt': markedAt?.toIso8601String(),
      'subjectId': subjectId,
      'subjectName': subjectName,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  AttendanceModel copyWith({
    String? id,
    String? studentId,
    String? studentName,
    String? classId,
    String? className,
    String? sectionId,
    String? sectionName,
    DateTime? date,
    AttendanceStatus? status,
    String? remarks,
    String? markedById,
    String? markedByName,
    DateTime? markedAt,
    String? subjectId,
    String? subjectName,
    DateTime? createdAt,
  }) {
    return AttendanceModel(
      id: id ?? this.id,
      studentId: studentId ?? this.studentId,
      studentName: studentName ?? this.studentName,
      classId: classId ?? this.classId,
      className: className ?? this.className,
      sectionId: sectionId ?? this.sectionId,
      sectionName: sectionName ?? this.sectionName,
      date: date ?? this.date,
      status: status ?? this.status,
      remarks: remarks ?? this.remarks,
      markedById: markedById ?? this.markedById,
      markedByName: markedByName ?? this.markedByName,
      markedAt: markedAt ?? this.markedAt,
      subjectId: subjectId ?? this.subjectId,
      subjectName: subjectName ?? this.subjectName,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  static DateTime _parseDate(dynamic value) {
    if (value == null) return DateTime.now();
    if (value is String) return DateTime.tryParse(value) ?? DateTime.now();
    if (value is DateTime) return value;
    return DateTime.now();
  }

  static AttendanceStatus _parseStatus(String? value) {
    switch (value?.toLowerCase()) {
      case 'absent':
        return AttendanceStatus.absent;
      case 'late':
        return AttendanceStatus.late;
      case 'leave':
        return AttendanceStatus.leave;
      case 'half_day':
      case 'halfday':
        return AttendanceStatus.halfDay;
      case 'excused':
        return AttendanceStatus.excused;
      default:
        return AttendanceStatus.present;
    }
  }

  @override
  List<Object?> get props => [id, studentId, date, status, classId, sectionId];
}
