// lib/models/section_model.dart
import 'package:equatable/equatable.dart';

class SectionModel extends Equatable {
  final String id;
  final String name;
  final String? classId;
  final String? className;
  final String? roomNumber;
  final int? capacity;
  final String? teacherId;
  final String? teacherName;
  final bool isActive;
  final DateTime? createdAt;
  final int? totalStudents;

  const SectionModel({
    required this.id,
    required this.name,
    this.classId,
    this.className,
    this.roomNumber,
    this.capacity,
    this.teacherId,
    this.teacherName,
    this.isActive = true,
    this.createdAt,
    this.totalStudents,
  });

  factory SectionModel.fromJson(Map<String, dynamic> json) {
    return SectionModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      classId: json['classId']?.toString() ?? json['class_id']?.toString(),
      className: json['className']?.toString() ?? json['class_name']?.toString(),
      roomNumber: json['roomNumber']?.toString() ?? json['room_number']?.toString(),
      capacity: json['capacity'],
      teacherId: json['teacherId']?.toString() ?? json['teacher_id']?.toString(),
      teacherName: json['teacherName']?.toString() ?? json['teacher_name']?.toString(),
      isActive: json['isActive'] ?? json['is_active'] ?? true,
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.tryParse((json['createdAt'] ?? json['created_at']).toString())
          : null,
      totalStudents: json['totalStudents'] ?? json['total_students'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'classId': classId,
      'className': className,
      'roomNumber': roomNumber,
      'capacity': capacity,
      'teacherId': teacherId,
      'teacherName': teacherName,
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
      'totalStudents': totalStudents,
    };
  }

  SectionModel copyWith({
    String? id,
    String? name,
    String? classId,
    String? className,
    String? roomNumber,
    int? capacity,
    String? teacherId,
    String? teacherName,
    bool? isActive,
    DateTime? createdAt,
    int? totalStudents,
  }) {
    return SectionModel(
      id: id ?? this.id,
      name: name ?? this.name,
      classId: classId ?? this.classId,
      className: className ?? this.className,
      roomNumber: roomNumber ?? this.roomNumber,
      capacity: capacity ?? this.capacity,
      teacherId: teacherId ?? this.teacherId,
      teacherName: teacherName ?? this.teacherName,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      totalStudents: totalStudents ?? this.totalStudents,
    );
  }

  @override
  List<Object?> get props => [id, name, classId, isActive];
}
