// lib/models/parent_model.dart
import 'package:equatable/equatable.dart';
import 'user_model.dart';

class ParentModel extends Equatable {
  final String id;
  final String userId;
  final UserModel? user;
  final String? cnic;
  final String? occupation;
  final String? address;
  final String? phoneSecondary;
  final String? phoneWork;
  final List<String> studentIds;
  final List<StudentLink> students;
  final bool isActive;
  final DateTime? createdAt;
  final bool hasPassword;

  const ParentModel({
    required this.id,
    required this.userId,
    this.user,
    this.cnic,
    this.occupation,
    this.address,
    this.phoneSecondary,
    this.phoneWork,
    this.studentIds = const [],
    this.students = const [],
    this.isActive = true,
    this.createdAt,
    this.hasPassword = false,
  });

  factory ParentModel.fromJson(Map<String, dynamic> json) {
    return ParentModel(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? json['user_id']?.toString() ?? '',
      user: json['user'] != null ? UserModel.fromJson(json['user'] as Map<String, dynamic>) : null,
      cnic: json['cnic']?.toString(),
      occupation: json['occupation']?.toString(),
      address: json['address']?.toString(),
      phoneSecondary: json['phoneSecondary']?.toString() ?? json['phone_secondary']?.toString(),
      phoneWork: json['phoneWork']?.toString() ?? json['phone_work']?.toString(),
      studentIds: _parseStringList(json['studentIds'] ?? json['student_ids']),
      students: json['students'] != null
          ? (json['students'] as List).map((e) => StudentLink.fromJson(e as Map<String, dynamic>)).toList()
          : const [],
      isActive: json['isActive'] ?? json['is_active'] ?? true,
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.tryParse((json['createdAt'] ?? json['created_at']).toString())
          : null,
      hasPassword: json['hasPassword'] ?? json['has_password'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'user': user?.toJson(),
      'cnic': cnic,
      'occupation': occupation,
      'address': address,
      'phoneSecondary': phoneSecondary,
      'phoneWork': phoneWork,
      'studentIds': studentIds,
      'students': students.map((e) => e.toJson()).toList(),
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
      'hasPassword': hasPassword,
    };
  }

  ParentModel copyWith({
    String? id,
    String? userId,
    UserModel? user,
    String? cnic,
    String? occupation,
    String? address,
    String? phoneSecondary,
    String? phoneWork,
    List<String>? studentIds,
    List<StudentLink>? students,
    bool? isActive,
    DateTime? createdAt,
    bool? hasPassword,
  }) {
    return ParentModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      user: user ?? this.user,
      cnic: cnic ?? this.cnic,
      occupation: occupation ?? this.occupation,
      address: address ?? this.address,
      phoneSecondary: phoneSecondary ?? this.phoneSecondary,
      phoneWork: phoneWork ?? this.phoneWork,
      studentIds: studentIds ?? this.studentIds,
      students: students ?? this.students,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      hasPassword: hasPassword ?? this.hasPassword,
    );
  }

  static List<String> _parseStringList(dynamic value) {
    if (value == null) return [];
    if (value is List) return value.map((e) => e.toString()).toList();
    return [];
  }

  @override
  List<Object?> get props => [id, userId, cnic, studentIds, isActive, hasPassword];
}

class StudentLink extends Equatable {
  final String studentId;
  final String studentName;
  final String? relation;
  final String? className;
  final String? sectionName;

  const StudentLink({
    required this.studentId,
    required this.studentName,
    this.relation,
    this.className,
    this.sectionName,
  });

  factory StudentLink.fromJson(Map<String, dynamic> json) {
    return StudentLink(
      studentId: json['studentId']?.toString() ?? json['student_id']?.toString() ?? '',
      studentName: json['studentName']?.toString() ?? json['student_name']?.toString() ?? '',
      relation: json['relation']?.toString(),
      className: json['className']?.toString() ?? json['class_name']?.toString(),
      sectionName: json['sectionName']?.toString() ?? json['section_name']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'studentId': studentId,
      'studentName': studentName,
      'relation': relation,
      'className': className,
      'sectionName': sectionName,
    };
  }

  @override
  List<Object?> get props => [studentId, studentName, relation];
}
