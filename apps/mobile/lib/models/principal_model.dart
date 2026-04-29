// lib/models/principal_model.dart
import 'package:equatable/equatable.dart';
import 'user_model.dart';

class PrincipalModel extends Equatable {
  final String id;
  final String userId;
  final UserModel? user;
  final String? employeeId;
  final String? designation;
  final String? qualification;
  final DateTime? joiningDate;
  final String? address;
  final String? phoneOffice;
  final bool isActive;
  final DateTime? createdAt;
  final String? schoolId;

  const PrincipalModel({
    required this.id,
    required this.userId,
    this.user,
    this.employeeId,
    this.designation,
    this.qualification,
    this.joiningDate,
    this.address,
    this.phoneOffice,
    this.isActive = true,
    this.createdAt,
    this.schoolId,
  });

  factory PrincipalModel.fromJson(Map<String, dynamic> json) {
    return PrincipalModel(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? json['user_id']?.toString() ?? '',
      user: json['user'] != null ? UserModel.fromJson(json['user'] as Map<String, dynamic>) : null,
      employeeId: json['employeeId']?.toString() ?? json['employee_id']?.toString(),
      designation: json['designation']?.toString(),
      qualification: json['qualification']?.toString(),
      joiningDate: json['joiningDate'] != null || json['joining_date'] != null
          ? DateTime.tryParse((json['joiningDate'] ?? json['joining_date']).toString())
          : null,
      address: json['address']?.toString(),
      phoneOffice: json['phoneOffice']?.toString() ?? json['phone_office']?.toString(),
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
      'employeeId': employeeId,
      'designation': designation,
      'qualification': qualification,
      'joiningDate': joiningDate?.toIso8601String(),
      'address': address,
      'phoneOffice': phoneOffice,
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
      'schoolId': schoolId,
    };
  }

  PrincipalModel copyWith({
    String? id,
    String? userId,
    UserModel? user,
    String? employeeId,
    String? designation,
    String? qualification,
    DateTime? joiningDate,
    String? address,
    String? phoneOffice,
    bool? isActive,
    DateTime? createdAt,
    String? schoolId,
  }) {
    return PrincipalModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      user: user ?? this.user,
      employeeId: employeeId ?? this.employeeId,
      designation: designation ?? this.designation,
      qualification: qualification ?? this.qualification,
      joiningDate: joiningDate ?? this.joiningDate,
      address: address ?? this.address,
      phoneOffice: phoneOffice ?? this.phoneOffice,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      schoolId: schoolId ?? this.schoolId,
    );
  }

  @override
  List<Object?> get props => [id, userId, employeeId, schoolId, isActive];
}
