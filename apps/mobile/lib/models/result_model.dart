// lib/models/result_model.dart
import 'package:equatable/equatable.dart';

class ResultModel extends Equatable {
  final String id;
  final String studentId;
  final String? studentName;
  final String? classId;
  final String? className;
  final String? sectionId;
  final String? sectionName;
  final String examType;
  final String? examName;
  final DateTime? examDate;
  final double? totalMarksObtained;
  final double? totalMaxMarks;
  final double? percentage;
  final String? overallGrade;
  final String? overallRemarks;
  final String? rank;
  final String? status;
  final bool isPublished;
  final DateTime? publishedAt;
  final DateTime? createdAt;
  final List<ResultDetailModel>? details;

  const ResultModel({
    required this.id,
    required this.studentId,
    this.studentName,
    this.classId,
    this.className,
    this.sectionId,
    this.sectionName,
    required this.examType,
    this.examName,
    this.examDate,
    this.totalMarksObtained,
    this.totalMaxMarks,
    this.percentage,
    this.overallGrade,
    this.overallRemarks,
    this.rank,
    this.status,
    this.isPublished = false,
    this.publishedAt,
    this.createdAt,
    this.details,
  });

  factory ResultModel.fromJson(Map<String, dynamic> json) {
    return ResultModel(
      id: json['id']?.toString() ?? '',
      studentId: json['studentId']?.toString() ?? json['student_id']?.toString() ?? '',
      studentName: json['studentName']?.toString() ?? json['student_name']?.toString(),
      classId: json['classId']?.toString() ?? json['class_id']?.toString(),
      className: json['className']?.toString() ?? json['class_name']?.toString(),
      sectionId: json['sectionId']?.toString() ?? json['section_id']?.toString(),
      sectionName: json['sectionName']?.toString() ?? json['section_name']?.toString(),
      examType: json['examType']?.toString() ?? json['exam_type']?.toString() ?? '',
      examName: json['examName']?.toString() ?? json['exam_name']?.toString(),
      examDate: json['examDate'] != null || json['exam_date'] != null
          ? DateTime.tryParse((json['examDate'] ?? json['exam_date']).toString())
          : null,
      totalMarksObtained: json['totalMarksObtained'] != null || json['total_marks_obtained'] != null
          ? _parseDouble(json['totalMarksObtained'] ?? json['total_marks_obtained'])
          : null,
      totalMaxMarks: json['totalMaxMarks'] != null || json['total_max_marks'] != null
          ? _parseDouble(json['totalMaxMarks'] ?? json['total_max_marks'])
          : null,
      percentage: json['percentage'] != null ? _parseDouble(json['percentage']) : null,
      overallGrade: json['overallGrade']?.toString() ?? json['overall_grade']?.toString(),
      overallRemarks: json['overallRemarks']?.toString() ?? json['overall_remarks']?.toString(),
      rank: json['rank']?.toString(),
      status: json['status']?.toString(),
      isPublished: json['isPublished'] ?? json['is_published'] ?? false,
      publishedAt: json['publishedAt'] != null || json['published_at'] != null
          ? DateTime.tryParse((json['publishedAt'] ?? json['published_at']).toString())
          : null,
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.tryParse((json['createdAt'] ?? json['created_at']).toString())
          : null,
      details: json['details'] != null
          ? (json['details'] as List).map((e) => ResultDetailModel.fromJson(e as Map<String, dynamic>)).toList()
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
      'examType': examType,
      'examName': examName,
      'examDate': examDate?.toIso8601String(),
      'totalMarksObtained': totalMarksObtained,
      'totalMaxMarks': totalMaxMarks,
      'percentage': percentage,
      'overallGrade': overallGrade,
      'overallRemarks': overallRemarks,
      'rank': rank,
      'status': status,
      'isPublished': isPublished,
      'publishedAt': publishedAt?.toIso8601String(),
      'createdAt': createdAt?.toIso8601String(),
      'details': details?.map((e) => e.toJson()).toList(),
    };
  }

  ResultModel copyWith({
    String? id,
    String? studentId,
    String? studentName,
    String? classId,
    String? className,
    String? sectionId,
    String? sectionName,
    String? examType,
    String? examName,
    DateTime? examDate,
    double? totalMarksObtained,
    double? totalMaxMarks,
    double? percentage,
    String? overallGrade,
    String? overallRemarks,
    String? rank,
    String? status,
    bool? isPublished,
    DateTime? publishedAt,
    DateTime? createdAt,
    List<ResultDetailModel>? details,
  }) {
    return ResultModel(
      id: id ?? this.id,
      studentId: studentId ?? this.studentId,
      studentName: studentName ?? this.studentName,
      classId: classId ?? this.classId,
      className: className ?? this.className,
      sectionId: sectionId ?? this.sectionId,
      sectionName: sectionName ?? this.sectionName,
      examType: examType ?? this.examType,
      examName: examName ?? this.examName,
      examDate: examDate ?? this.examDate,
      totalMarksObtained: totalMarksObtained ?? this.totalMarksObtained,
      totalMaxMarks: totalMaxMarks ?? this.totalMaxMarks,
      percentage: percentage ?? this.percentage,
      overallGrade: overallGrade ?? this.overallGrade,
      overallRemarks: overallRemarks ?? this.overallRemarks,
      rank: rank ?? this.rank,
      status: status ?? this.status,
      isPublished: isPublished ?? this.isPublished,
      publishedAt: publishedAt ?? this.publishedAt,
      createdAt: createdAt ?? this.createdAt,
      details: details ?? this.details,
    );
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  @override
  List<Object?> get props => [id, studentId, examType, isPublished, percentage];
}

class ResultDetailModel extends Equatable {
  final String id;
  final String? resultId;
  final String subjectId;
  final String? subjectName;
  final double marksObtained;
  final double totalMarks;
  final double? percentage;
  final String? grade;
  final String? remarks;
  final String? teacherId;
  final String? teacherName;
  final DateTime? createdAt;

  const ResultDetailModel({
    required this.id,
    this.resultId,
    required this.subjectId,
    this.subjectName,
    required this.marksObtained,
    required this.totalMarks,
    this.percentage,
    this.grade,
    this.remarks,
    this.teacherId,
    this.teacherName,
    this.createdAt,
  });

  factory ResultDetailModel.fromJson(Map<String, dynamic> json) {
    return ResultDetailModel(
      id: json['id']?.toString() ?? '',
      resultId: json['resultId']?.toString() ?? json['result_id']?.toString(),
      subjectId: json['subjectId']?.toString() ?? json['subject_id']?.toString() ?? '',
      subjectName: json['subjectName']?.toString() ?? json['subject_name']?.toString(),
      marksObtained: _parseDouble(json['marksObtained'] ?? json['marks_obtained']),
      totalMarks: _parseDouble(json['totalMarks'] ?? json['total_marks']),
      percentage: json['percentage'] != null ? _parseDouble(json['percentage']) : null,
      grade: json['grade']?.toString(),
      remarks: json['remarks']?.toString(),
      teacherId: json['teacherId']?.toString() ?? json['teacher_id']?.toString(),
      teacherName: json['teacherName']?.toString() ?? json['teacher_name']?.toString(),
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.tryParse((json['createdAt'] ?? json['created_at']).toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'resultId': resultId,
      'subjectId': subjectId,
      'subjectName': subjectName,
      'marksObtained': marksObtained,
      'totalMarks': totalMarks,
      'percentage': percentage,
      'grade': grade,
      'remarks': remarks,
      'teacherId': teacherId,
      'teacherName': teacherName,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  ResultDetailModel copyWith({
    String? id,
    String? resultId,
    String? subjectId,
    String? subjectName,
    double? marksObtained,
    double? totalMarks,
    double? percentage,
    String? grade,
    String? remarks,
    String? teacherId,
    String? teacherName,
    DateTime? createdAt,
  }) {
    return ResultDetailModel(
      id: id ?? this.id,
      resultId: resultId ?? this.resultId,
      subjectId: subjectId ?? this.subjectId,
      subjectName: subjectName ?? this.subjectName,
      marksObtained: marksObtained ?? this.marksObtained,
      totalMarks: totalMarks ?? this.totalMarks,
      percentage: percentage ?? this.percentage,
      grade: grade ?? this.grade,
      remarks: remarks ?? this.remarks,
      teacherId: teacherId ?? this.teacherId,
      teacherName: teacherName ?? this.teacherName,
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
  List<Object?> get props => [id, subjectId, marksObtained, totalMarks];
}
