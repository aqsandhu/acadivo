// lib/models/homework_submission_model.dart
import 'package:equatable/equatable.dart';

enum SubmissionStatus { pending, submitted, graded, late, missing }

class HomeworkSubmissionModel extends Equatable {
  final String id;
  final String homeworkId;
  final String? homeworkTitle;
  final String studentId;
  final String? studentName;
  final String? classId;
  final String? sectionId;
  final DateTime? submittedAt;
  final String? submissionText;
  final List<String>? attachmentUrls;
  final SubmissionStatus status;
  final String? feedback;
  final double? marks;
  final double? totalMarks;
  final String? gradedById;
  final String? gradedByName;
  final DateTime? gradedAt;
  final DateTime? createdAt;

  const HomeworkSubmissionModel({
    required this.id,
    required this.homeworkId,
    this.homeworkTitle,
    required this.studentId,
    this.studentName,
    this.classId,
    this.sectionId,
    this.submittedAt,
    this.submissionText,
    this.attachmentUrls,
    this.status = SubmissionStatus.pending,
    this.feedback,
    this.marks,
    this.totalMarks,
    this.gradedById,
    this.gradedByName,
    this.gradedAt,
    this.createdAt,
  });

  factory HomeworkSubmissionModel.fromJson(Map<String, dynamic> json) {
    return HomeworkSubmissionModel(
      id: json['id']?.toString() ?? '',
      homeworkId: json['homeworkId']?.toString() ?? json['homework_id']?.toString() ?? '',
      homeworkTitle: json['homeworkTitle']?.toString() ?? json['homework_title']?.toString(),
      studentId: json['studentId']?.toString() ?? json['student_id']?.toString() ?? '',
      studentName: json['studentName']?.toString() ?? json['student_name']?.toString(),
      classId: json['classId']?.toString() ?? json['class_id']?.toString(),
      sectionId: json['sectionId']?.toString() ?? json['section_id']?.toString(),
      submittedAt: json['submittedAt'] != null || json['submitted_at'] != null
          ? DateTime.tryParse((json['submittedAt'] ?? json['submitted_at']).toString())
          : null,
      submissionText: json['submissionText']?.toString() ?? json['submission_text']?.toString(),
      attachmentUrls: _parseStringList(json['attachmentUrls'] ?? json['attachments']),
      status: _parseStatus(json['status']?.toString()),
      feedback: json['feedback']?.toString(),
      marks: json['marks'] != null ? (json['marks'] as num).toDouble() : null,
      totalMarks: json['totalMarks'] != null || json['total_marks'] != null
          ? ((json['totalMarks'] ?? json['total_marks']) as num).toDouble()
          : null,
      gradedById: json['gradedById']?.toString() ?? json['graded_by_id']?.toString(),
      gradedByName: json['gradedByName']?.toString() ?? json['graded_by_name']?.toString(),
      gradedAt: json['gradedAt'] != null || json['graded_at'] != null
          ? DateTime.tryParse((json['gradedAt'] ?? json['graded_at']).toString())
          : null,
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.tryParse((json['createdAt'] ?? json['created_at']).toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'homeworkId': homeworkId,
      'homeworkTitle': homeworkTitle,
      'studentId': studentId,
      'studentName': studentName,
      'classId': classId,
      'sectionId': sectionId,
      'submittedAt': submittedAt?.toIso8601String(),
      'submissionText': submissionText,
      'attachmentUrls': attachmentUrls,
      'status': status.name,
      'feedback': feedback,
      'marks': marks,
      'totalMarks': totalMarks,
      'gradedById': gradedById,
      'gradedByName': gradedByName,
      'gradedAt': gradedAt?.toIso8601String(),
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  HomeworkSubmissionModel copyWith({
    String? id,
    String? homeworkId,
    String? homeworkTitle,
    String? studentId,
    String? studentName,
    String? classId,
    String? sectionId,
    DateTime? submittedAt,
    String? submissionText,
    List<String>? attachmentUrls,
    SubmissionStatus? status,
    String? feedback,
    double? marks,
    double? totalMarks,
    String? gradedById,
    String? gradedByName,
    DateTime? gradedAt,
    DateTime? createdAt,
  }) {
    return HomeworkSubmissionModel(
      id: id ?? this.id,
      homeworkId: homeworkId ?? this.homeworkId,
      homeworkTitle: homeworkTitle ?? this.homeworkTitle,
      studentId: studentId ?? this.studentId,
      studentName: studentName ?? this.studentName,
      classId: classId ?? this.classId,
      sectionId: sectionId ?? this.sectionId,
      submittedAt: submittedAt ?? this.submittedAt,
      submissionText: submissionText ?? this.submissionText,
      attachmentUrls: attachmentUrls ?? this.attachmentUrls,
      status: status ?? this.status,
      feedback: feedback ?? this.feedback,
      marks: marks ?? this.marks,
      totalMarks: totalMarks ?? this.totalMarks,
      gradedById: gradedById ?? this.gradedById,
      gradedByName: gradedByName ?? this.gradedByName,
      gradedAt: gradedAt ?? this.gradedAt,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  static List<String> _parseStringList(dynamic value) {
    if (value == null) return [];
    if (value is List) return value.map((e) => e.toString()).toList();
    return [];
  }

  static SubmissionStatus _parseStatus(String? value) {
    switch (value?.toLowerCase()) {
      case 'submitted':
        return SubmissionStatus.submitted;
      case 'graded':
        return SubmissionStatus.graded;
      case 'late':
        return SubmissionStatus.late;
      case 'missing':
        return SubmissionStatus.missing;
      default:
        return SubmissionStatus.pending;
    }
  }

  @override
  List<Object?> get props => [id, homeworkId, studentId, status, marks];
}
