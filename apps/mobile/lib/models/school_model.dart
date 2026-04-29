// lib/models/school_model.dart
import 'package:equatable/equatable.dart';

class SchoolModel extends Equatable {
  final String id;
  final String name;
  final String? uniqueCode;
  final String? address;
  final String? city;
  final String? province;
  final String? phone;
  final String? email;
  final String? website;
  final String? logoUrl;
  final String? boardAffiliation;
  final String? principalName;
  final bool isActive;
  final DateTime? subscriptionExpiry;
  final DateTime? createdAt;
  final int? totalStudents;
  final int? totalTeachers;
  final int? totalClasses;

  const SchoolModel({
    required this.id,
    required this.name,
    this.uniqueCode,
    this.address,
    this.city,
    this.province,
    this.phone,
    this.email,
    this.website,
    this.logoUrl,
    this.boardAffiliation,
    this.principalName,
    this.isActive = true,
    this.subscriptionExpiry,
    this.createdAt,
    this.totalStudents,
    this.totalTeachers,
    this.totalClasses,
  });

  factory SchoolModel.fromJson(Map<String, dynamic> json) {
    return SchoolModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      uniqueCode: json['uniqueCode']?.toString() ?? json['unique_code']?.toString(),
      address: json['address']?.toString(),
      city: json['city']?.toString(),
      province: json['province']?.toString(),
      phone: json['phone']?.toString(),
      email: json['email']?.toString(),
      website: json['website']?.toString(),
      logoUrl: json['logoUrl']?.toString() ?? json['logo']?.toString(),
      boardAffiliation: json['boardAffiliation']?.toString() ?? json['board_affiliation']?.toString(),
      principalName: json['principalName']?.toString() ?? json['principal_name']?.toString(),
      isActive: json['isActive'] ?? json['is_active'] ?? true,
      subscriptionExpiry: json['subscriptionExpiry'] != null || json['subscription_expiry'] != null
          ? DateTime.tryParse((json['subscriptionExpiry'] ?? json['subscription_expiry']).toString())
          : null,
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.tryParse((json['createdAt'] ?? json['created_at']).toString())
          : null,
      totalStudents: json['totalStudents'] ?? json['total_students'],
      totalTeachers: json['totalTeachers'] ?? json['total_teachers'],
      totalClasses: json['totalClasses'] ?? json['total_classes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'uniqueCode': uniqueCode,
      'address': address,
      'city': city,
      'province': province,
      'phone': phone,
      'email': email,
      'website': website,
      'logoUrl': logoUrl,
      'boardAffiliation': boardAffiliation,
      'principalName': principalName,
      'isActive': isActive,
      'subscriptionExpiry': subscriptionExpiry?.toIso8601String(),
      'createdAt': createdAt?.toIso8601String(),
      'totalStudents': totalStudents,
      'totalTeachers': totalTeachers,
      'totalClasses': totalClasses,
    };
  }

  SchoolModel copyWith({
    String? id,
    String? name,
    String? uniqueCode,
    String? address,
    String? city,
    String? province,
    String? phone,
    String? email,
    String? website,
    String? logoUrl,
    String? boardAffiliation,
    String? principalName,
    bool? isActive,
    DateTime? subscriptionExpiry,
    DateTime? createdAt,
    int? totalStudents,
    int? totalTeachers,
    int? totalClasses,
  }) {
    return SchoolModel(
      id: id ?? this.id,
      name: name ?? this.name,
      uniqueCode: uniqueCode ?? this.uniqueCode,
      address: address ?? this.address,
      city: city ?? this.city,
      province: province ?? this.province,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      website: website ?? this.website,
      logoUrl: logoUrl ?? this.logoUrl,
      boardAffiliation: boardAffiliation ?? this.boardAffiliation,
      principalName: principalName ?? this.principalName,
      isActive: isActive ?? this.isActive,
      subscriptionExpiry: subscriptionExpiry ?? this.subscriptionExpiry,
      createdAt: createdAt ?? this.createdAt,
      totalStudents: totalStudents ?? this.totalStudents,
      totalTeachers: totalTeachers ?? this.totalTeachers,
      totalClasses: totalClasses ?? this.totalClasses,
    );
  }

  @override
  List<Object?> get props => [id, name, uniqueCode, isActive];
}
