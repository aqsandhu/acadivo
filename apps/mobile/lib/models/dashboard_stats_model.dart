// lib/models/dashboard_stats_model.dart
import 'package:equatable/equatable.dart';

class DashboardStatsModel extends Equatable {
  final int totalStudents;
  final int totalTeachers;
  final int totalParents;
  final int totalClasses;
  final int totalSections;
  final int totalSubjects;
  final double? totalFeeCollected;
  final double? totalFeePending;
  final double? attendancePercentage;
  final int totalHomeworkPending;
  final int totalHomeworkSubmitted;
  final int totalAnnouncements;
  final int unreadNotifications;
  final int unreadMessages;
  final int? activeStudents;
  final int? presentToday;
  final int? absentToday;
  final int? lateToday;
  final List<DailyAttendanceStat>? weeklyAttendance;
  final List<FeeCollectionStat>? monthlyFeeCollection;
  final List<SubjectPerformanceStat>? subjectPerformance;
  final List<RecentActivity>? recentActivities;
  final DateTime? updatedAt;

  const DashboardStatsModel({
    this.totalStudents = 0,
    this.totalTeachers = 0,
    this.totalParents = 0,
    this.totalClasses = 0,
    this.totalSections = 0,
    this.totalSubjects = 0,
    this.totalFeeCollected,
    this.totalFeePending,
    this.attendancePercentage,
    this.totalHomeworkPending = 0,
    this.totalHomeworkSubmitted = 0,
    this.totalAnnouncements = 0,
    this.unreadNotifications = 0,
    this.unreadMessages = 0,
    this.activeStudents,
    this.presentToday,
    this.absentToday,
    this.lateToday,
    this.weeklyAttendance,
    this.monthlyFeeCollection,
    this.subjectPerformance,
    this.recentActivities,
    this.updatedAt,
  });

  factory DashboardStatsModel.fromJson(Map<String, dynamic> json) {
    return DashboardStatsModel(
      totalStudents: json['totalStudents'] ?? json['total_students'] ?? 0,
      totalTeachers: json['totalTeachers'] ?? json['total_teachers'] ?? 0,
      totalParents: json['totalParents'] ?? json['total_parents'] ?? 0,
      totalClasses: json['totalClasses'] ?? json['total_classes'] ?? 0,
      totalSections: json['totalSections'] ?? json['total_sections'] ?? 0,
      totalSubjects: json['totalSubjects'] ?? json['total_subjects'] ?? 0,
      totalFeeCollected: json['totalFeeCollected'] != null || json['total_fee_collected'] != null
          ? _parseDouble(json['totalFeeCollected'] ?? json['total_fee_collected'])
          : null,
      totalFeePending: json['totalFeePending'] != null || json['total_fee_pending'] != null
          ? _parseDouble(json['totalFeePending'] ?? json['total_fee_pending'])
          : null,
      attendancePercentage: json['attendancePercentage'] != null || json['attendance_percentage'] != null
          ? _parseDouble(json['attendancePercentage'] ?? json['attendance_percentage'])
          : null,
      totalHomeworkPending: json['totalHomeworkPending'] ?? json['total_homework_pending'] ?? 0,
      totalHomeworkSubmitted: json['totalHomeworkSubmitted'] ?? json['total_homework_submitted'] ?? 0,
      totalAnnouncements: json['totalAnnouncements'] ?? json['total_announcements'] ?? 0,
      unreadNotifications: json['unreadNotifications'] ?? json['unread_notifications'] ?? 0,
      unreadMessages: json['unreadMessages'] ?? json['unread_messages'] ?? 0,
      activeStudents: json['activeStudents'] ?? json['active_students'],
      presentToday: json['presentToday'] ?? json['present_today'],
      absentToday: json['absentToday'] ?? json['absent_today'],
      lateToday: json['lateToday'] ?? json['late_today'],
      weeklyAttendance: json['weeklyAttendance'] != null || json['weekly_attendance'] != null
          ? (json['weeklyAttendance'] ?? json['weekly_attendance'] as List)
              .map((e) => DailyAttendanceStat.fromJson(e as Map<String, dynamic>))
              .toList()
          : null,
      monthlyFeeCollection: json['monthlyFeeCollection'] != null || json['monthly_fee_collection'] != null
          ? (json['monthlyFeeCollection'] ?? json['monthly_fee_collection'] as List)
              .map((e) => FeeCollectionStat.fromJson(e as Map<String, dynamic>))
              .toList()
          : null,
      subjectPerformance: json['subjectPerformance'] != null || json['subject_performance'] != null
          ? (json['subjectPerformance'] ?? json['subject_performance'] as List)
              .map((e) => SubjectPerformanceStat.fromJson(e as Map<String, dynamic>))
              .toList()
          : null,
      recentActivities: json['recentActivities'] != null || json['recent_activities'] != null
          ? (json['recentActivities'] ?? json['recent_activities'] as List)
              .map((e) => RecentActivity.fromJson(e as Map<String, dynamic>))
              .toList()
          : null,
      updatedAt: json['updatedAt'] != null || json['updated_at'] != null
          ? DateTime.tryParse((json['updatedAt'] ?? json['updated_at']).toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalStudents': totalStudents,
      'totalTeachers': totalTeachers,
      'totalParents': totalParents,
      'totalClasses': totalClasses,
      'totalSections': totalSections,
      'totalSubjects': totalSubjects,
      'totalFeeCollected': totalFeeCollected,
      'totalFeePending': totalFeePending,
      'attendancePercentage': attendancePercentage,
      'totalHomeworkPending': totalHomeworkPending,
      'totalHomeworkSubmitted': totalHomeworkSubmitted,
      'totalAnnouncements': totalAnnouncements,
      'unreadNotifications': unreadNotifications,
      'unreadMessages': unreadMessages,
      'activeStudents': activeStudents,
      'presentToday': presentToday,
      'absentToday': absentToday,
      'lateToday': lateToday,
      'weeklyAttendance': weeklyAttendance?.map((e) => e.toJson()).toList(),
      'monthlyFeeCollection': monthlyFeeCollection?.map((e) => e.toJson()).toList(),
      'subjectPerformance': subjectPerformance?.map((e) => e.toJson()).toList(),
      'recentActivities': recentActivities?.map((e) => e.toJson()).toList(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  DashboardStatsModel copyWith({
    int? totalStudents,
    int? totalTeachers,
    int? totalParents,
    int? totalClasses,
    int? totalSections,
    int? totalSubjects,
    double? totalFeeCollected,
    double? totalFeePending,
    double? attendancePercentage,
    int? totalHomeworkPending,
    int? totalHomeworkSubmitted,
    int? totalAnnouncements,
    int? unreadNotifications,
    int? unreadMessages,
    int? activeStudents,
    int? presentToday,
    int? absentToday,
    int? lateToday,
    List<DailyAttendanceStat>? weeklyAttendance,
    List<FeeCollectionStat>? monthlyFeeCollection,
    List<SubjectPerformanceStat>? subjectPerformance,
    List<RecentActivity>? recentActivities,
    DateTime? updatedAt,
  }) {
    return DashboardStatsModel(
      totalStudents: totalStudents ?? this.totalStudents,
      totalTeachers: totalTeachers ?? this.totalTeachers,
      totalParents: totalParents ?? this.totalParents,
      totalClasses: totalClasses ?? this.totalClasses,
      totalSections: totalSections ?? this.totalSections,
      totalSubjects: totalSubjects ?? this.totalSubjects,
      totalFeeCollected: totalFeeCollected ?? this.totalFeeCollected,
      totalFeePending: totalFeePending ?? this.totalFeePending,
      attendancePercentage: attendancePercentage ?? this.attendancePercentage,
      totalHomeworkPending: totalHomeworkPending ?? this.totalHomeworkPending,
      totalHomeworkSubmitted: totalHomeworkSubmitted ?? this.totalHomeworkSubmitted,
      totalAnnouncements: totalAnnouncements ?? this.totalAnnouncements,
      unreadNotifications: unreadNotifications ?? this.unreadNotifications,
      unreadMessages: unreadMessages ?? this.unreadMessages,
      activeStudents: activeStudents ?? this.activeStudents,
      presentToday: presentToday ?? this.presentToday,
      absentToday: absentToday ?? this.absentToday,
      lateToday: lateToday ?? this.lateToday,
      weeklyAttendance: weeklyAttendance ?? this.weeklyAttendance,
      monthlyFeeCollection: monthlyFeeCollection ?? this.monthlyFeeCollection,
      subjectPerformance: subjectPerformance ?? this.subjectPerformance,
      recentActivities: recentActivities ?? this.recentActivities,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  @override
  List<Object?> get props => [totalStudents, totalTeachers, totalClasses, updatedAt];
}

class DailyAttendanceStat extends Equatable {
  final String day;
  final double presentPercentage;
  final int totalStudents;
  final int present;
  final int absent;
  final int late;

  const DailyAttendanceStat({
    required this.day,
    required this.presentPercentage,
    required this.totalStudents,
    required this.present,
    required this.absent,
    required this.late,
  });

  factory DailyAttendanceStat.fromJson(Map<String, dynamic> json) {
    return DailyAttendanceStat(
      day: json['day']?.toString() ?? '',
      presentPercentage: DashboardStatsModel._parseDouble(json['presentPercentage'] ?? json['present_percentage']),
      totalStudents: json['totalStudents'] ?? json['total_students'] ?? 0,
      present: json['present'] ?? 0,
      absent: json['absent'] ?? 0,
      late: json['late'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'day': day,
      'presentPercentage': presentPercentage,
      'totalStudents': totalStudents,
      'present': present,
      'absent': absent,
      'late': late,
    };
  }

  @override
  List<Object?> get props => [day, presentPercentage, totalStudents];
}

class FeeCollectionStat extends Equatable {
  final String month;
  final double collected;
  final double pending;
  final double total;

  const FeeCollectionStat({
    required this.month,
    required this.collected,
    required this.pending,
    required this.total,
  });

  factory FeeCollectionStat.fromJson(Map<String, dynamic> json) {
    return FeeCollectionStat(
      month: json['month']?.toString() ?? '',
      collected: DashboardStatsModel._parseDouble(json['collected']),
      pending: DashboardStatsModel._parseDouble(json['pending']),
      total: DashboardStatsModel._parseDouble(json['total']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'month': month,
      'collected': collected,
      'pending': pending,
      'total': total,
    };
  }

  @override
  List<Object?> get props => [month, collected, pending];
}

class SubjectPerformanceStat extends Equatable {
  final String subjectId;
  final String subjectName;
  final double averageMarks;
  final double highestMarks;
  final double lowestMarks;
  final int totalStudents;

  const SubjectPerformanceStat({
    required this.subjectId,
    required this.subjectName,
    required this.averageMarks,
    required this.highestMarks,
    required this.lowestMarks,
    required this.totalStudents,
  });

  factory SubjectPerformanceStat.fromJson(Map<String, dynamic> json) {
    return SubjectPerformanceStat(
      subjectId: json['subjectId']?.toString() ?? json['subject_id']?.toString() ?? '',
      subjectName: json['subjectName']?.toString() ?? json['subject_name']?.toString() ?? '',
      averageMarks: DashboardStatsModel._parseDouble(json['averageMarks'] ?? json['average_marks']),
      highestMarks: DashboardStatsModel._parseDouble(json['highestMarks'] ?? json['highest_marks']),
      lowestMarks: DashboardStatsModel._parseDouble(json['lowestMarks'] ?? json['lowest_marks']),
      totalStudents: json['totalStudents'] ?? json['total_students'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'subjectId': subjectId,
      'subjectName': subjectName,
      'averageMarks': averageMarks,
      'highestMarks': highestMarks,
      'lowestMarks': lowestMarks,
      'totalStudents': totalStudents,
    };
  }

  @override
  List<Object?> get props => [subjectId, subjectName, averageMarks];
}

class RecentActivity extends Equatable {
  final String id;
  final String title;
  final String? description;
  final String type;
  final DateTime? timestamp;
  final String? route;

  const RecentActivity({
    required this.id,
    required this.title,
    this.description,
    required this.type,
    this.timestamp,
    this.route,
  });

  factory RecentActivity.fromJson(Map<String, dynamic> json) {
    return RecentActivity(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      type: json['type']?.toString() ?? '',
      timestamp: json['timestamp'] != null
          ? DateTime.tryParse(json['timestamp'].toString())
          : null,
      route: json['route']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'type': type,
      'timestamp': timestamp?.toIso8601String(),
      'route': route,
    };
  }

  @override
  List<Object?> get props => [id, title, type, timestamp];
}
