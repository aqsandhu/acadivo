// lib/utils/formatters.dart
import 'package:intl/intl.dart';

import 'app_constants.dart';

class Formatters {
  Formatters._();

  // Date formatters
  static String formatDate(DateTime? date, {String? format}) {
    if (date == null) return 'N/A';
    return DateFormat(format ?? AppConstants.dateFormat).format(date);
  }

  static String formatDateTime(DateTime? date) {
    if (date == null) return 'N/A';
    return DateFormat(AppConstants.dateTimeFormat).format(date);
  }

  static String formatTime(DateTime? date) {
    if (date == null) return 'N/A';
    return DateFormat(AppConstants.timeFormat).format(date);
  }

  static String formatIsoDate(DateTime? date) {
    if (date == null) return '';
    return DateFormat(AppConstants.isoDateFormat).format(date);
  }

  static String formatRelative(DateTime? date) {
    if (date == null) return 'N/A';
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays > 365) {
      return '${(diff.inDays / 365).floor()}y ago';
    } else if (diff.inDays > 30) {
      return '${(diff.inDays / 30).floor()}mo ago';
    } else if (diff.inDays > 7) {
      return '${(diff.inDays / 7).floor()}w ago';
    } else if (diff.inDays > 0) {
      return '${diff.inDays}d ago';
    } else if (diff.inHours > 0) {
      return '${diff.inHours}h ago';
    } else if (diff.inMinutes > 0) {
      return '${diff.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }

  // Currency formatters
  static String formatCurrency(double? amount, {String? currency}) {
    if (amount == null) return '${AppConstants.currencySymbol}0.00';
    final formatter = NumberFormat.currency(
      symbol: AppConstants.currencySymbol,
      decimalDigits: 2,
    );
    return formatter.format(amount);
  }

  static String formatCurrencyCompact(double? amount) {
    if (amount == null) return '${AppConstants.currencySymbol}0';
    if (amount >= 1000000) {
      return '${AppConstants.currencySymbol}${(amount / 1000000).toStringAsFixed(1)}M';
    } else if (amount >= 1000) {
      return '${AppConstants.currencySymbol}${(amount / 1000).toStringAsFixed(1)}K';
    }
    return '${AppConstants.currencySymbol}${amount.toStringAsFixed(0)}';
  }

  // Number formatters
  static String formatNumber(int? number) {
    if (number == null) return '0';
    return NumberFormat('#,##0').format(number);
  }

  static String formatDecimal(double? number, {int decimalDigits = 2}) {
    if (number == null) return '0.${'0' * decimalDigits}';
    return NumberFormat('#,##0.${'0' * decimalDigits}').format(number);
  }

  static String formatPercentage(double? value, {int decimalDigits = 1}) {
    if (value == null) return '0%';
    return '${value.toStringAsFixed(decimalDigits)}%';
  }

  // Phone formatters
  static String formatPhone(String? phone) {
    if (phone == null || phone.isEmpty) return 'N/A';
    final clean = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    if (clean.startsWith('+92') && clean.length >= 13) {
      return '${clean.substring(0, 3)} ${clean.substring(3, 6)}-${clean.substring(6, 9)}-${clean.substring(9)}';
    } else if (clean.startsWith('03') && clean.length == 11) {
      return '${clean.substring(0, 4)}-${clean.substring(4, 7)}-${clean.substring(7)}';
    }
    return clean;
  }

  // CNIC formatter
  static String formatCnic(String? cnic) {
    if (cnic == null || cnic.isEmpty) return 'N/A';
    final clean = cnic.replaceAll(RegExp(r'[^0-9]'), '');
    if (clean.length == 13) {
      return '${clean.substring(0, 5)}-${clean.substring(5, 12)}-${clean.substring(12)}';
    }
    return clean;
  }

  // Name formatter
  static String formatName(String? firstName, {String? lastName}) {
    if (firstName == null || firstName.isEmpty) return 'N/A';
    if (lastName != null && lastName.isNotEmpty) {
      return '$firstName $lastName';
    }
    return firstName;
  }

  // Attendance percentage color
  static String attendanceStatusColor(double? percentage) {
    if (percentage == null) return 'grey';
    if (percentage >= 90) return 'green';
    if (percentage >= 75) return 'yellow';
    if (percentage >= 60) return 'orange';
    return 'red';
  }
}
