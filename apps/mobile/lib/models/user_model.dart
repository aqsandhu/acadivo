// lib/models/user_model.dart
import 'package:equatable/equatable.dart';

enum UserRole {
  superAdmin,
  principal,
  schoolAdmin,
  teacher,
  student,
  parent,
  unknown;

  String get value {
    switch (this) {
      case UserRole.superAdmin:
        return 'super_admin';
      case UserRole.principal:
        return 'principal';
      case UserRole.schoolAdmin:
        return 'school_admin';
      case UserRole.teacher:
        return 'teacher';
      case UserRole.student:
        return 'student';
      case UserRole.parent:
        return 'parent';
      case UserRole.unknown:
        return 'unknown';
    }
  }

  static UserRole fromString(String? role) {
    switch (role) {
      case 'super_admin':
        return UserRole.superAdmin;
      case 'principal':
        return UserRole.principal;
      case 'school_admin':
        return UserRole.schoolAdmin;
      case 'teacher':
        return UserRole.teacher;
      case 'student':
        return UserRole.student;
      case 'parent':
        return UserRole.parent;
      default:
        return UserRole.unknown;
    }
  }

  bool get isAdmin => this == UserRole.superAdmin || this == UserRole.schoolAdmin || this == UserRole.principal;
  bool get isTeacher => this == UserRole.teacher;
  bool get isStudent => this == UserRole.student;
  bool get isParent => this == UserRole.parent;
  bool get isStaff => this == UserRole.superAdmin || this == UserRole.principal || this == UserRole.schoolAdmin || this == UserRole.teacher;
}

class UserModel extends Equatable {
  final String id;
  final String uniqueId;
  final String name;
  final String email;
  final String? phone;
  final String? avatarUrl;
  final UserRole role;
  final String? schoolId;
  final String? schoolName;
  final bool isActive;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final DateTime? lastLoginAt;

  const UserModel({
    required this.id,
    required this.uniqueId,
    required this.name,
    required this.email,
    this.phone,
    this.avatarUrl,
    required this.role,
    this.schoolId,
    this.schoolName,
    this.isActive = true,
    this.createdAt,
    this.updatedAt,
    this.lastLoginAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      uniqueId: json['uniqueId']?.toString() ?? json['unique_id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString(),
      avatarUrl: json['avatarUrl']?.toString() ?? json['avatar']?.toString(),
      role: UserRole.fromString(json['role']?.toString()),
      schoolId: json['schoolId']?.toString() ?? json['school_id']?.toString(),
      schoolName: json['schoolName']?.toString() ?? json['school_name']?.toString(),
      isActive: json['isActive'] ?? json['is_active'] ?? true,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'].toString()) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt'].toString()) : null,
      lastLoginAt: json['lastLoginAt'] != null ? DateTime.parse(json['lastLoginAt'].toString()) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'uniqueId': uniqueId,
      'name': name,
      'email': email,
      'phone': phone,
      'avatarUrl': avatarUrl,
      'role': role.value,
      'schoolId': schoolId,
      'schoolName': schoolName,
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      'lastLoginAt': lastLoginAt?.toIso8601String(),
    };
  }

  UserModel copyWith({
    String? id,
    String? uniqueId,
    String? name,
    String? email,
    String? phone,
    String? avatarUrl,
    UserRole? role,
    String? schoolId,
    String? schoolName,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? lastLoginAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      uniqueId: uniqueId ?? this.uniqueId,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      role: role ?? this.role,
      schoolId: schoolId ?? this.schoolId,
      schoolName: schoolName ?? this.schoolName,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
    );
  }

  @override
  List<Object?> get props => [id, uniqueId, name, email, role, schoolId, isActive];
}
