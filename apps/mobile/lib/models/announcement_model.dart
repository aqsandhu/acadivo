// lib/models/announcement_model.dart
import 'package:equatable/equatable.dart';

enum AnnouncementAudience { all, students, teachers, parents, staff, specificClass, specificSection }

class AnnouncementModel extends Equatable {
  final String id;
  final String title;
  final String content;
  final String? summary;
  final AnnouncementAudience audience;
  final String? classId;
  final String? sectionId;
  final String? postedById;
  final String? postedByName;
  final String? postedByRole;
  final DateTime? postedAt;
  final DateTime? expiresAt;
  final bool isPinned;
  final bool isActive;
  final List<String>? attachmentUrls;
  final int? viewCount;
  final DateTime? createdAt;

  const AnnouncementModel({
    required this.id,
    required this.title,
    required this.content,
    this.summary,
    this.audience = AnnouncementAudience.all,
    this.classId,
    this.sectionId,
    this.postedById,
    this.postedByName,
    this.postedByRole,
    this.postedAt,
    this.expiresAt,
    this.isPinned = false,
    this.isActive = true,
    this.attachmentUrls,
    this.viewCount,
    this.createdAt,
  });

  factory AnnouncementModel.fromJson(Map<String, dynamic> json) {
    return AnnouncementModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      summary: json['summary']?.toString(),
      audience: _parseAudience(json['audience']?.toString()),
      classId: json['classId']?.toString() ?? json['class_id']?.toString(),
      sectionId: json['sectionId']?.toString() ?? json['section_id']?.toString(),
      postedById: json['postedById']?.toString() ?? json['posted_by_id']?.toString(),
      postedByName: json['postedByName']?.toString() ?? json['posted_by_name']?.toString(),
      postedByRole: json['postedByRole']?.toString() ?? json['posted_by_role']?.toString(),
      postedAt: json['postedAt'] != null || json['posted_at'] != null
          ? DateTime.tryParse((json['postedAt'] ?? json['posted_at']).toString())
          : null,
      expiresAt: json['expiresAt'] != null || json['expires_at'] != null
          ? DateTime.tryParse((json['expiresAt'] ?? json['expires_at']).toString())
          : null,
      isPinned: json['isPinned'] ?? json['is_pinned'] ?? false,
      isActive: json['isActive'] ?? json['is_active'] ?? true,
      attachmentUrls: _parseStringList(json['attachmentUrls'] ?? json['attachments']),
      viewCount: json['viewCount'] ?? json['view_count'],
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.tryParse((json['createdAt'] ?? json['created_at']).toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'summary': summary,
      'audience': audience.name,
      'classId': classId,
      'sectionId': sectionId,
      'postedById': postedById,
      'postedByName': postedByName,
      'postedByRole': postedByRole,
      'postedAt': postedAt?.toIso8601String(),
      'expiresAt': expiresAt?.toIso8601String(),
      'isPinned': isPinned,
      'isActive': isActive,
      'attachmentUrls': attachmentUrls,
      'viewCount': viewCount,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  AnnouncementModel copyWith({
    String? id,
    String? title,
    String? content,
    String? summary,
    AnnouncementAudience? audience,
    String? classId,
    String? sectionId,
    String? postedById,
    String? postedByName,
    String? postedByRole,
    DateTime? postedAt,
    DateTime? expiresAt,
    bool? isPinned,
    bool? isActive,
    List<String>? attachmentUrls,
    int? viewCount,
    DateTime? createdAt,
  }) {
    return AnnouncementModel(
      id: id ?? this.id,
      title: title ?? this.title,
      content: content ?? this.content,
      summary: summary ?? this.summary,
      audience: audience ?? this.audience,
      classId: classId ?? this.classId,
      sectionId: sectionId ?? this.sectionId,
      postedById: postedById ?? this.postedById,
      postedByName: postedByName ?? this.postedByName,
      postedByRole: postedByRole ?? this.postedByRole,
      postedAt: postedAt ?? this.postedAt,
      expiresAt: expiresAt ?? this.expiresAt,
      isPinned: isPinned ?? this.isPinned,
      isActive: isActive ?? this.isActive,
      attachmentUrls: attachmentUrls ?? this.attachmentUrls,
      viewCount: viewCount ?? this.viewCount,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  static AnnouncementAudience _parseAudience(String? value) {
    switch (value?.toLowerCase()) {
      case 'students':
        return AnnouncementAudience.students;
      case 'teachers':
        return AnnouncementAudience.teachers;
      case 'parents':
        return AnnouncementAudience.parents;
      case 'staff':
        return AnnouncementAudience.staff;
      case 'specific_class':
        return AnnouncementAudience.specificClass;
      case 'specific_section':
        return AnnouncementAudience.specificSection;
      default:
        return AnnouncementAudience.all;
    }
  }

  static List<String> _parseStringList(dynamic value) {
    if (value == null) return [];
    if (value is List) return value.map((e) => e.toString()).toList();
    return [];
  }

  @override
  List<Object?> get props => [id, title, audience, isPinned, postedAt];
}
