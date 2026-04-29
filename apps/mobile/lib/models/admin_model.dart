// lib/models/admin_model.dart
import 'package:equatable/equatable.dart';
import 'user_model.dart';

enum AdminType { school, superAdmin, unknown }

class AdminModel extends Equatable {
  final String id;
  final String userId;
  final UserModel? user;
  final AdminType type;
  final String? permissions;
  final String? designation;
  final String? employeeId;
  final DateTime? joiningDate;
  final bool isActive;
  final DateTime? createdAt;
  final String? schoolId;

  const AdminModel({
    required this.id,
    required this.userId,
    this.user,
    this.type = AdminType.unknown,
    this.permissions,
    this.designation,
    this.employeeId,
    this.joiningDate,
    this.isActive = true,
    this.createdAt,
    this.schoolId,
  });

  factory AdminModel.fromJson(Map<String, dynamic> json) {
    return AdminModel(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? json['user_id']?.toString() ?? '',
      user: json['user'] != null ? UserModel.fromJson(json['user'] as Map<String, dynamic>) : null,
      type: _parseType(json['type']?.toString() ?? json['admin_type']?.toString()),
      permissions: json['permissions']?.toString(),
      designation: json['designation']?.toString(),
      employeeId: json['employeeId']?.toString() ?? json['employee_id']?.toString(),
      joiningDate: json['joiningDate'] != null || json['joining_date'] != null
          ? DateTime.tryParse((json['joiningDate'] ?? json['joining_date']).toString())
          : null,
      isActive: json['isActive'] ?? json['is_active'] ?? true,
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.tryParse((json['createdAt'] ?? json['created_at']).toString())
          : null,
      schoolId: json['schoolId']?.toString() ?? json['school_id']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'user': user?.toJson(),
      'type': type.name,
      'permissions': permissions,
      'designation': designation,
      'employeeId': employeeId,
      'joiningDate': joiningDate?.toIso8601String(),
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
      'schoolId': schoolId,
    };
  }

  AdminModel copyWith({
    String? id,
    String? userId,
    UserModel? user,
    AdminType? type,
    String? permissions,
    String? designation,
    String? employeeId,
    DateTime? joiningDate,
    bool? isActive,
    DateTime? createdAt,
    String? schoolId,
  }) {
    return AdminModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      user: user ?? this.user,
      type: type ?? this.type,
      permissions: permissions ?? this.permissions,
      designation: designation ?? this.designation,
      employeeId: employeeId ?? this.employeeId,
      joiningDate: joiningDate ?? this.joiningDate,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      schoolId: schoolId ?? this.schoolId,
    );
  }

  static AdminType _parseType(String? value) {
    switch (value) {
      case 'super_admin':
        return AdminType.superAdmin;
      case 'school':
        return AdminType.school;
      default:
        return AdminType.unknown;
    }
  }

  @override
  List<Object?> get props => [id, userId, type, schoolId, isActive];
}
