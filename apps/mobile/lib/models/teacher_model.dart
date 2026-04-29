// lib/models/teacher_model.dart
import 'package:equatable/equatable.dart';
import 'user_model.dart';

class TeacherModel extends Equatable {
  final String id;
  final String userId;
  final UserModel? user;
  final String? employeeId;
  final String? designation;
  final List<String> subjectIds;
  final List<String> classIds;
  final String? qualification;
  final DateTime? joiningDate;
  final String? address;
  final bool isActive;
  final DateTime? createdAt;

  const TeacherModel({
    required this.id,
    required this.userId,
    this.user,
    this.employeeId,
    this.designation,
    this.subjectIds = const [],
    this.classIds = const [],
    this.qualification,
    this.joiningDate,
    this.address,
    this.isActive = true,
    this.createdAt,
  });

  factory TeacherModel.fromJson(Map<String, dynamic> json) {
    return TeacherModel(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? json['user_id']?.toString() ?? '',
      user: json['user'] != null ? UserModel.fromJson(json['user'] as Map<String, dynamic>) : null,
      employeeId: json['employeeId']?.toString() ?? json['employee_id']?.toString(),
      designation: json['designation']?.toString(),
      subjectIds: _parseStringList(json['subjectIds'] ?? json['subject_ids']),
      classIds: _parseStringList(json['classIds'] ?? json['class_ids']),
      qualification: json['qualification']?.toString(),
      joiningDate: json['joiningDate'] != null || json['joining_date'] != null
          ? DateTime.tryParse((json['joiningDate'] ?? json['joining_date']).toString())
          : null,
      address: json['address']?.toString(),
      isActive: json['isActive'] ?? json['is_active'] ?? true,
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.tryParse((json['createdAt'] ?? json['created_at']).toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'user': user?.toJson(),
      'employeeId': employeeId,
      'designation': designation,
      'subjectIds': subjectIds,
      'classIds': classIds,
      'qualification': qualification,
      'joiningDate': joiningDate?.toIso8601String(),
      'address': address,
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  TeacherModel copyWith({
    String? id,
    String? userId,
    UserModel? user,
    String? employeeId,
    String? designation,
    List<String>? subjectIds,
    List<String>? classIds,
    String? qualification,
    DateTime? joiningDate,
    String? address,
    bool? isActive,
    DateTime? createdAt,
  }) {
    return TeacherModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      user: user ?? this.user,
      employeeId: employeeId ?? this.employeeId,
      designation: designation ?? this.designation,
      subjectIds: subjectIds ?? this.subjectIds,
      classIds: classIds ?? this.classIds,
      qualification: qualification ?? this.qualification,
      joiningDate: joiningDate ?? this.joiningDate,
      address: address ?? this.address,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  static List<String> _parseStringList(dynamic value) {
    if (value == null) return [];
    if (value is List) return value.map((e) => e.toString()).toList();
    return [];
  }

  @override
  List<Object?> get props => [id, userId, employeeId, designation, isActive];
}
