// lib/models/timetable_entry_model.dart
import 'package:equatable/equatable.dart';

enum DayOfWeek { monday, tuesday, wednesday, thursday, friday, saturday, sunday }

class TimetableEntryModel extends Equatable {
  final String id;
  final String classId;
  final String? className;
  final String? sectionId;
  final String? sectionName;
  final String subjectId;
  final String? subjectName;
  final String teacherId;
  final String? teacherName;
  final DayOfWeek day;
  final String startTime;
  final String endTime;
  final String? roomNumber;
  final bool isActive;
  final DateTime? createdAt;

  const TimetableEntryModel({
    required this.id,
    required this.classId,
    this.className,
    this.sectionId,
    this.sectionName,
    required this.subjectId,
    this.subjectName,
    required this.teacherId,
    this.teacherName,
    required this.day,
    required this.startTime,
    required this.endTime,
    this.roomNumber,
    this.isActive = true,
    this.createdAt,
  });

  factory TimetableEntryModel.fromJson(Map<String, dynamic> json) {
    return TimetableEntryModel(
      id: json['id']?.toString() ?? '',
      classId: json['classId']?.toString() ?? json['class_id']?.toString() ?? '',
      className: json['className']?.toString() ?? json['class_name']?.toString(),
      sectionId: json['sectionId']?.toString() ?? json['section_id']?.toString(),
      sectionName: json['sectionName']?.toString() ?? json['section_name']?.toString(),
      subjectId: json['subjectId']?.toString() ?? json['subject_id']?.toString() ?? '',
      subjectName: json['subjectName']?.toString() ?? json['subject_name']?.toString(),
      teacherId: json['teacherId']?.toString() ?? json['teacher_id']?.toString() ?? '',
      teacherName: json['teacherName']?.toString() ?? json['teacher_name']?.toString(),
      day: _parseDay(json['day']?.toString()),
      startTime: json['startTime']?.toString() ?? json['start_time']?.toString() ?? '',
      endTime: json['endTime']?.toString() ?? json['end_time']?.toString() ?? '',
      roomNumber: json['roomNumber']?.toString() ?? json['room_number']?.toString(),
      isActive: json['isActive'] ?? json['is_active'] ?? true,
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.tryParse((json['createdAt'] ?? json['created_at']).toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'classId': classId,
      'className': className,
      'sectionId': sectionId,
      'sectionName': sectionName,
      'subjectId': subjectId,
      'subjectName': subjectName,
      'teacherId': teacherId,
      'teacherName': teacherName,
      'day': day.name,
      'startTime': startTime,
      'endTime': endTime,
      'roomNumber': roomNumber,
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  TimetableEntryModel copyWith({
    String? id,
    String? classId,
    String? className,
    String? sectionId,
    String? sectionName,
    String? subjectId,
    String? subjectName,
    String? teacherId,
    String? teacherName,
    DayOfWeek? day,
    String? startTime,
    String? endTime,
    String? roomNumber,
    bool? isActive,
    DateTime? createdAt,
  }) {
    return TimetableEntryModel(
      id: id ?? this.id,
      classId: classId ?? this.classId,
      className: className ?? this.className,
      sectionId: sectionId ?? this.sectionId,
      sectionName: sectionName ?? this.sectionName,
      subjectId: subjectId ?? this.subjectId,
      subjectName: subjectName ?? this.subjectName,
      teacherId: teacherId ?? this.teacherId,
      teacherName: teacherName ?? this.teacherName,
      day: day ?? this.day,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      roomNumber: roomNumber ?? this.roomNumber,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  static DayOfWeek _parseDay(String? value) {
    switch (value?.toLowerCase()) {
      case 'tuesday':
        return DayOfWeek.tuesday;
      case 'wednesday':
        return DayOfWeek.wednesday;
      case 'thursday':
        return DayOfWeek.thursday;
      case 'friday':
        return DayOfWeek.friday;
      case 'saturday':
        return DayOfWeek.saturday;
      case 'sunday':
        return DayOfWeek.sunday;
      default:
        return DayOfWeek.monday;
    }
  }

  @override
  List<Object?> get props => [id, classId, sectionId, subjectId, day, startTime];
}
