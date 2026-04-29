// lib/models/student_model.dart
import 'package:equatable/equatable.dart';
import 'user_model.dart';

class StudentModel extends Equatable {
  final String id;
  final String userId;
  final UserModel? user;
  final String? rollNumber;
  final String? admissionNumber;
  final String? classId;
  final String? className;
  final String? sectionId;
  final String? sectionName;
  final DateTime? dateOfBirth;
  final String? gender;
  final String? address;
  final String? guardianName;
  final String? guardianPhone;
  final String? guardianRelation;
  final String? bloodGroup;
  final DateTime? admissionDate;
  final bool isActive;
  final DateTime? createdAt;

  const StudentModel({
    required this.id,
    required this.userId,
    this.user,
    this.rollNumber,
    this.admissionNumber,
    this.classId,
    this.className,
    this.sectionId,
    this.sectionName,
    this.dateOfBirth,
    this.gender,
    this.address,
    this.guardianName,
    this.guardianPhone,
    this.guardianRelation,
    this.bloodGroup,
    this.admissionDate,
    this.isActive = true,
    this.createdAt,
  });

  factory StudentModel.fromJson(Map<String, dynamic> json) {
    return StudentModel(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? json['user_id']?.toString() ?? '',
      user: json['user'] != null ? UserModel.fromJson(json['user'] as Map<String, dynamic>) : null,
      rollNumber: json['rollNumber']?.toString() ?? json['roll_number']?.toString(),
      admissionNumber: json['admissionNumber']?.toString() ?? json['admission_number']?.toString(),
      classId: json['classId']?.toString() ?? json['class_id']?.toString(),
      className: json['className']?.toString() ?? json['class_name']?.toString(),
      sectionId: json['sectionId']?.toString() ?? json['section_id']?.toString(),
      sectionName: json['sectionName']?.toString() ?? json['section_name']?.toString(),
      dateOfBirth: json['dateOfBirth'] != null || json['date_of_birth'] != null
          ? DateTime.tryParse((json['dateOfBirth'] ?? json['date_of_birth']).toString())
          : null,
      gender: json['gender']?.toString(),
      address: json['address']?.toString(),
      guardianName: json['guardianName']?.toString() ?? json['guardian_name']?.toString(),
      guardianPhone: json['guardianPhone']?.toString() ?? json['guardian_phone']?.toString(),
      guardianRelation: json['guardianRelation']?.toString() ?? json['guardian_relation']?.toString(),
      bloodGroup: json['bloodGroup']?.toString() ?? json['blood_group']?.toString(),
      admissionDate: json['admissionDate'] != null || json['admission_date'] != null
          ? DateTime.tryParse((json['admissionDate'] ?? json['admission_date']).toString())
          : null,
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
      'rollNumber': rollNumber,
      'admissionNumber': admissionNumber,
      'classId': classId,
      'className': className,
      'sectionId': sectionId,
      'sectionName': sectionName,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'gender': gender,
      'address': address,
      'guardianName': guardianName,
      'guardianPhone': guardianPhone,
      'guardianRelation': guardianRelation,
      'bloodGroup': bloodGroup,
      'admissionDate': admissionDate?.toIso8601String(),
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  StudentModel copyWith({
    String? id,
    String? userId,
    UserModel? user,
    String? rollNumber,
    String? admissionNumber,
    String? classId,
    String? className,
    String? sectionId,
    String? sectionName,
    DateTime? dateOfBirth,
    String? gender,
    String? address,
    String? guardianName,
    String? guardianPhone,
    String? guardianRelation,
    String? bloodGroup,
    DateTime? admissionDate,
    bool? isActive,
    DateTime? createdAt,
  }) {
    return StudentModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      user: user ?? this.user,
      rollNumber: rollNumber ?? this.rollNumber,
      admissionNumber: admissionNumber ?? this.admissionNumber,
      classId: classId ?? this.classId,
      className: className ?? this.className,
      sectionId: sectionId ?? this.sectionId,
      sectionName: sectionName ?? this.sectionName,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      gender: gender ?? this.gender,
      address: address ?? this.address,
      guardianName: guardianName ?? this.guardianName,
      guardianPhone: guardianPhone ?? this.guardianPhone,
      guardianRelation: guardianRelation ?? this.guardianRelation,
      bloodGroup: bloodGroup ?? this.bloodGroup,
      admissionDate: admissionDate ?? this.admissionDate,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  List<Object?> get props => [id, userId, rollNumber, classId, sectionId, isActive];
}
