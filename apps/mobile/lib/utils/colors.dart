// lib/utils/colors.dart
import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Primary palette
  static const Color primary = Color(0xFF1E40AF);
  static const Color primaryLight = Color(0xFF3B82F6);
  static const Color primaryDark = Color(0xFF1E3A5F);
  static const Color primaryContainer = Color(0xFFDBEAFE);

  // Secondary palette
  static const Color secondary = Color(0xFF059669);
  static const Color secondaryLight = Color(0xFF34D399);
  static const Color secondaryDark = Color(0xFF047857);
  static const Color secondaryContainer = Color(0xFFD1FAE5);

  // Accent colors
  static const Color accent = Color(0xFFF59E0B);
  static const Color accentLight = Color(0xFFFCD34D);
  static const Color accentDark = Color(0xFFD97706);

  // Semantic colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // Neutral colors - Light
  static const Color background = Color(0xFFF8FAFC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF1F5F9);
  static const Color onSurface = Color(0xFF1E293B);
  static const Color onSurfaceVariant = Color(0xFF64748B);
  static const Color outline = Color(0xFFE2E8F0);
  static const Color outlineVariant = Color(0xFFCBD5E1);

  // Neutral colors - Dark
  static const Color darkBackground = Color(0xFF0F172A);
  static const Color darkSurface = Color(0xFF1E293B);
  static const Color darkSurfaceVariant = Color(0xFF334155);
  static const Color darkOnSurface = Color(0xFFF1F5F9);
  static const Color darkOnSurfaceVariant = Color(0xFF94A3B8);
  static const Color darkOutline = Color(0xFF334155);
  static const Color darkOutlineVariant = Color(0xFF475569);

  // Text colors
  static const Color textPrimary = Color(0xFF1E293B);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textTertiary = Color(0xFF94A3B8);
  static const Color textDisabled = Color(0xFFCBD5E1);
  static const Color textInverse = Color(0xFFFFFFFF);

  // Dark text colors
  static const Color darkTextPrimary = Color(0xFFF1F5F9);
  static const Color darkTextSecondary = Color(0xFF94A3B8);
  static const Color darkTextTertiary = Color(0xFF64748B);

  // Status colors
  static const Color present = Color(0xFF10B981);
  static const Color absent = Color(0xFFEF4444);
  static const Color late = Color(0xFFF59E0B);
  static const Color leave = Color(0xFF8B5CF6);
  static const Color halfDay = Color(0xFFF97316);

  // Fee status
  static const Color feePaid = Color(0xFF10B981);
  static const Color feePending = Color(0xFFF59E0B);
  static const Color feeOverdue = Color(0xFFEF4444);
  static const Color feePartial = Color(0xFF3B82F6);

  // Grade colors
  static const Color gradeA = Color(0xFF10B981);
  static const Color gradeB = Color(0xFF3B82F6);
  static const Color gradeC = Color(0xFFF59E0B);
  static const Color gradeD = Color(0xFFF97316);
  static const Color gradeF = Color(0xFFEF4444);
}
