// lib/models/report_request_model.dart
import 'package:equatable/equatable.dart';

enum ReportRequestStatus { pending, approved, rejected, processing, ready, delivered }

enum ReportType { academic, attendance, behavior, fee, transcript, character, all }

class ReportRequestModel extends Equatable {
  final String id;
  final String? studentId;
  final String? studentName;
  final String? parentId;
  final String? parentName;
  final ReportType reportType;
  final ReportRequestStatus status;
  final String? requestedById;
  final String? requestedByName;
  final DateTime? requestedAt;
  final DateTime? processedAt;
  final String? remarks;
  final String? rejectReason;
  final String? documentUrl;
  final DateTime? createdAt;

  const ReportRequestModel({
    required this.id,
    this.studentId,
    this.studentName,
    this.parentId,
    this.parentName,
    this.reportType = ReportType.academic,
    this.status = ReportRequestStatus.pending,
    this.requestedById,
    this.requestedByName,
    this.requestedAt,
    this.processedAt,
    this.remarks,
    this.rejectReason,
    this.documentUrl,
    this.createdAt,
  });

  factory ReportRequestModel.fromJson(Map<String, dynamic> json) {
    return ReportRequestModel(
      id: json['id']?.toString() ?? '',
      studentId: json['studentId']?.toString() ?? json['student_id']?.toString(),
      studentName: json['studentName']?.toString() ?? json['student_name']?.toString(),
      parentId: json['parentId']?.toString() ?? json['parent_id']?.toString(),
      parentName: json['parentName']?.toString() ?? json['parent_name']?.toString(),
      reportType: _parseReportType(json['reportType']?.toString() ?? json['report_type']?.toString()),
      status: _parseStatus(json['status']?.toString()),
      requestedById: json['requestedById']?.toString() ?? json['requested_by_id']?.toString(),
      requestedByName: json['requestedByName']?.toString() ?? json['requested_by_name']?.toString(),
      requestedAt: json['requestedAt'] != null || json['requested_at'] != null
          ? DateTime.tryParse((json['requestedAt'] ?? json['requested_at']).toString())
          : null,
      processedAt: json['processedAt'] != null || json['processed_at'] != null
          ? DateTime.tryParse((json['processedAt'] ?? json['processed_at']).toString())
          : null,
      remarks: json['remarks']?.toString(),
      rejectReason: json['rejectReason']?.toString() ?? json['reject_reason']?.toString(),
      documentUrl: json['documentUrl']?.toString() ?? json['document_url']?.toString(),
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
      'parentId': parentId,
      'parentName': parentName,
      'reportType': reportType.name,
      'status': status.name,
      'requestedById': requestedById,
      'requestedByName': requestedByName,
      'requestedAt': requestedAt?.toIso8601String(),
      'processedAt': processedAt?.toIso8601String(),
      'remarks': remarks,
      'rejectReason': rejectReason,
      'documentUrl': documentUrl,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  ReportRequestModel copyWith({
    String? id,
    String? studentId,
    String? studentName,
    String? parentId,
    String? parentName,
    ReportType? reportType,
    ReportRequestStatus? status,
    String? requestedById,
    String? requestedByName,
    DateTime? requestedAt,
    DateTime? processedAt,
    String? remarks,
    String? rejectReason,
    String? documentUrl,
    DateTime? createdAt,
  }) {
    return ReportRequestModel(
      id: id ?? this.id,
      studentId: studentId ?? this.studentId,
      studentName: studentName ?? this.studentName,
      parentId: parentId ?? this.parentId,
      parentName: parentName ?? this.parentName,
      reportType: reportType ?? this.reportType,
      status: status ?? this.status,
      requestedById: requestedById ?? this.requestedById,
      requestedByName: requestedByName ?? this.requestedByName,
      requestedAt: requestedAt ?? this.requestedAt,
      processedAt: processedAt ?? this.processedAt,
      remarks: remarks ?? this.remarks,
      rejectReason: rejectReason ?? this.rejectReason,
      documentUrl: documentUrl ?? this.documentUrl,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  static ReportType _parseReportType(String? value) {
    switch (value?.toLowerCase()) {
      case 'attendance':
        return ReportType.attendance;
      case 'behavior':
        return ReportType.behavior;
      case 'fee':
        return ReportType.fee;
      case 'transcript':
        return ReportType.transcript;
      case 'character':
        return ReportType.character;
      case 'all':
        return ReportType.all;
      default:
        return ReportType.academic;
    }
  }

  static ReportRequestStatus _parseStatus(String? value) {
    switch (value?.toLowerCase()) {
      case 'approved':
        return ReportRequestStatus.approved;
      case 'rejected':
        return ReportRequestStatus.rejected;
      case 'processing':
        return ReportRequestStatus.processing;
      case 'ready':
        return ReportRequestStatus.ready;
      case 'delivered':
        return ReportRequestStatus.delivered;
      default:
        return ReportRequestStatus.pending;
    }
  }

  @override
  List<Object?> get props => [id, studentId, reportType, status, requestedAt];
}
