// lib/models/advertisement_model.dart
import 'package:equatable/equatable.dart';

enum AdPlacement { banner, popup, sidebar, feed, splash }

enum AdStatus { active, paused, expired, scheduled }

class AdvertisementModel extends Equatable {
  final String id;
  final String title;
  final String? description;
  final String? imageUrl;
  final String? videoUrl;
  final String? linkUrl;
  final String? ctaText;
  final AdPlacement placement;
  final AdStatus status;
  final DateTime? startDate;
  final DateTime? endDate;
  final int? priority;
  final int? viewLimit;
  final int? viewCount;
  final int? clickCount;
  final String? targetAudience;
  final String? targetSchoolId;
  final DateTime? createdAt;

  const AdvertisementModel({
    required this.id,
    required this.title,
    this.description,
    this.imageUrl,
    this.videoUrl,
    this.linkUrl,
    this.ctaText,
    this.placement = AdPlacement.banner,
    this.status = AdStatus.scheduled,
    this.startDate,
    this.endDate,
    this.priority,
    this.viewLimit,
    this.viewCount,
    this.clickCount,
    this.targetAudience,
    this.targetSchoolId,
    this.createdAt,
  });

  factory AdvertisementModel.fromJson(Map<String, dynamic> json) {
    return AdvertisementModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      imageUrl: json['imageUrl']?.toString() ?? json['image_url']?.toString(),
      videoUrl: json['videoUrl']?.toString() ?? json['video_url']?.toString(),
      linkUrl: json['linkUrl']?.toString() ?? json['link_url']?.toString(),
      ctaText: json['ctaText']?.toString() ?? json['cta_text']?.toString(),
      placement: _parsePlacement(json['placement']?.toString()),
      status: _parseStatus(json['status']?.toString()),
      startDate: json['startDate'] != null || json['start_date'] != null
          ? DateTime.tryParse((json['startDate'] ?? json['start_date']).toString())
          : null,
      endDate: json['endDate'] != null || json['end_date'] != null
          ? DateTime.tryParse((json['endDate'] ?? json['end_date']).toString())
          : null,
      priority: json['priority'],
      viewLimit: json['viewLimit'] ?? json['view_limit'],
      viewCount: json['viewCount'] ?? json['view_count'],
      clickCount: json['clickCount'] ?? json['click_count'],
      targetAudience: json['targetAudience']?.toString() ?? json['target_audience']?.toString(),
      targetSchoolId: json['targetSchoolId']?.toString() ?? json['target_school_id']?.toString(),
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.tryParse((json['createdAt'] ?? json['created_at']).toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'imageUrl': imageUrl,
      'videoUrl': videoUrl,
      'linkUrl': linkUrl,
      'ctaText': ctaText,
      'placement': placement.name,
      'status': status.name,
      'startDate': startDate?.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
      'priority': priority,
      'viewLimit': viewLimit,
      'viewCount': viewCount,
      'clickCount': clickCount,
      'targetAudience': targetAudience,
      'targetSchoolId': targetSchoolId,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  AdvertisementModel copyWith({
    String? id,
    String? title,
    String? description,
    String? imageUrl,
    String? videoUrl,
    String? linkUrl,
    String? ctaText,
    AdPlacement? placement,
    AdStatus? status,
    DateTime? startDate,
    DateTime? endDate,
    int? priority,
    int? viewLimit,
    int? viewCount,
    int? clickCount,
    String? targetAudience,
    String? targetSchoolId,
    DateTime? createdAt,
  }) {
    return AdvertisementModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      videoUrl: videoUrl ?? this.videoUrl,
      linkUrl: linkUrl ?? this.linkUrl,
      ctaText: ctaText ?? this.ctaText,
      placement: placement ?? this.placement,
      status: status ?? this.status,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      priority: priority ?? this.priority,
      viewLimit: viewLimit ?? this.viewLimit,
      viewCount: viewCount ?? this.viewCount,
      clickCount: clickCount ?? this.clickCount,
      targetAudience: targetAudience ?? this.targetAudience,
      targetSchoolId: targetSchoolId ?? this.targetSchoolId,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  static AdPlacement _parsePlacement(String? value) {
    switch (value?.toLowerCase()) {
      case 'popup':
        return AdPlacement.popup;
      case 'sidebar':
        return AdPlacement.sidebar;
      case 'feed':
        return AdPlacement.feed;
      case 'splash':
        return AdPlacement.splash;
      default:
        return AdPlacement.banner;
    }
  }

  static AdStatus _parseStatus(String? value) {
    switch (value?.toLowerCase()) {
      case 'active':
        return AdStatus.active;
      case 'paused':
        return AdStatus.paused;
      case 'expired':
        return AdStatus.expired;
      default:
        return AdStatus.scheduled;
    }
  }

  @override
  List<Object?> get props => [id, title, placement, status, startDate, endDate];
}
