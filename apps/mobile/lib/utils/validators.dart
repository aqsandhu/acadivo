// lib/utils/validators.dart
class Validators {
  Validators._();

  static String? required(String? value, {String? fieldName}) {
    if (value == null || value.trim().isEmpty) {
      return '${fieldName ?? 'This field'} is required';
    }
    return null;
  }

  static String? email(String? value) {
    if (value == null || value.isEmpty) return 'Email is required';
    final regex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
    if (!regex.hasMatch(value)) return 'Please enter a valid email address';
    return null;
  }

  static String? phone(String? value) {
    if (value == null || value.isEmpty) return 'Phone number is required';
    // Pakistani phone validation
    final clean = value.replaceAll(RegExp(r'[^0-9+]'), '');
    if (clean.length < 11 || clean.length > 14) {
      return 'Please enter a valid phone number (e.g., 03XX-XXXXXXX)';
    }
    return null;
  }

  static String? minLength(String? value, int min, {String? fieldName}) {
    if (value == null || value.length < min) {
      return '${fieldName ?? 'This field'} must be at least $min characters';
    }
    return null;
  }

  static String? maxLength(String? value, int max, {String? fieldName}) {
    if (value != null && value.length > max) {
      return '${fieldName ?? 'This field'} must not exceed $max characters';
    }
    return null;
  }

  static String? password(String? value) {
    if (value == null || value.isEmpty) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!value.contains(RegExp(r'[A-Z]'))) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!value.contains(RegExp(r'[a-z]'))) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!value.contains(RegExp(r'[0-9]'))) {
      return 'Password must contain at least one number';
    }
    return null;
  }

  static String? confirmPassword(String? value, String password) {
    if (value == null || value.isEmpty) return 'Please confirm your password';
    if (value != password) return 'Passwords do not match';
    return null;
  }

  static String? cnic(String? value) {
    if (value == null || value.isEmpty) return 'CNIC is required';
    final clean = value.replaceAll(RegExp(r'[^0-9]'), '');
    if (clean.length != 13) {
      return 'Please enter a valid 13-digit CNIC number';
    }
    return null;
  }

  static String? rollNumber(String? value) {
    if (value == null || value.isEmpty) return 'Roll number is required';
    if (value.length > 20) return 'Roll number is too long';
    return null;
  }

  static String? amount(String? value) {
    if (value == null || value.isEmpty) return 'Amount is required';
    final amount = double.tryParse(value.replaceAll(',', ''));
    if (amount == null) return 'Please enter a valid amount';
    if (amount <= 0) return 'Amount must be greater than zero';
    return null;
  }

  static String? percentage(String? value) {
    if (value == null || value.isEmpty) return 'Percentage is required';
    final percentage = double.tryParse(value);
    if (percentage == null) return 'Please enter a valid number';
    if (percentage < 0 || percentage > 100) {
      return 'Percentage must be between 0 and 100';
    }
    return null;
  }

  static String? marks(String? value, {double? totalMarks}) {
    if (value == null || value.isEmpty) return 'Marks are required';
    final marks = double.tryParse(value);
    if (marks == null) return 'Please enter a valid number';
    if (marks < 0) return 'Marks cannot be negative';
    if (totalMarks != null && marks > totalMarks) {
      return 'Marks cannot exceed total marks ($totalMarks)';
    }
    return null;
  }

  static String? otp(String? value) {
    if (value == null || value.isEmpty) return 'OTP is required';
    if (value.length < 4 || value.length > 6) {
      return 'Please enter a valid OTP';
    }
    return null;
  }
}
