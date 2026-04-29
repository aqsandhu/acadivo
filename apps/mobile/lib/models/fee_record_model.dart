// lib/models/fee_record_model.dart
import 'package:equatable/equatable.dart';

enum FeePaymentStatus { pending, paid, partial, overdue, waived, refunded }

enum FeePaymentMethod { cash, bankTransfer, cheque, online, other }

class FeeRecordModel extends Equatable {
  final String id;
  final String studentId;
  final String? studentName;
  final String? studentRollNumber;
  final String feeStructureId;
  final String? feeName;
  final double amount;
  final double paidAmount;
  final double? discount;
  final double? fine;
  final FeePaymentStatus status;
  final FeePaymentMethod? paymentMethod;
  final String? transactionId;
  final String? receiptNumber;
  final String? remarks;
  final String? collectedById;
  final String? collectedByName;
  final DateTime? dueDate;
  final DateTime? paidDate;
  final DateTime? createdAt;

  const FeeRecordModel({
    required this.id,
    required this.studentId,
    this.studentName,
    this.studentRollNumber,
    required this.feeStructureId,
    this.feeName,
    required this.amount,
    this.paidAmount = 0.0,
    this.discount,
    this.fine,
    this.status = FeePaymentStatus.pending,
    this.paymentMethod,
    this.transactionId,
    this.receiptNumber,
    this.remarks,
    this.collectedById,
    this.collectedByName,
    this.dueDate,
    this.paidDate,
    this.createdAt,
  });

  factory FeeRecordModel.fromJson(Map<String, dynamic> json) {
    return FeeRecordModel(
      id: json['id']?.toString() ?? '',
      studentId: json['studentId']?.toString() ?? json['student_id']?.toString() ?? '',
      studentName: json['studentName']?.toString() ?? json['student_name']?.toString(),
      studentRollNumber: json['studentRollNumber']?.toString() ?? json['roll_number']?.toString(),
      feeStructureId: json['feeStructureId']?.toString() ?? json['fee_structure_id']?.toString() ?? '',
      feeName: json['feeName']?.toString() ?? json['fee_name']?.toString(),
      amount: _parseDouble(json['amount']),
      paidAmount: _parseDouble(json['paidAmount'] ?? json['paid_amount']),
      discount: json['discount'] != null ? _parseDouble(json['discount']) : null,
      fine: json['fine'] != null ? _parseDouble(json['fine']) : null,
      status: _parseStatus(json['status']?.toString()),
      paymentMethod: _parsePaymentMethod(json['paymentMethod']?.toString() ?? json['payment_method']?.toString()),
      transactionId: json['transactionId']?.toString() ?? json['transaction_id']?.toString(),
      receiptNumber: json['receiptNumber']?.toString() ?? json['receipt_number']?.toString(),
      remarks: json['remarks']?.toString(),
      collectedById: json['collectedById']?.toString() ?? json['collected_by_id']?.toString(),
      collectedByName: json['collectedByName']?.toString() ?? json['collected_by_name']?.toString(),
      dueDate: json['dueDate'] != null || json['due_date'] != null
          ? DateTime.tryParse((json['dueDate'] ?? json['due_date']).toString())
          : null,
      paidDate: json['paidDate'] != null || json['paid_date'] != null
          ? DateTime.tryParse((json['paidDate'] ?? json['paid_date']).toString())
          : null,
      createdAt: json['createdAt'] != null || json['created_at'] != null
          ? DateTime.tryParse((json['createdAt'] ?? json['created_at']).toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'studentId': studentId,
      'studentName': studentName,
      'studentRollNumber': studentRollNumber,
      'feeStructureId': feeStructureId,
      'feeName': feeName,
      'amount': amount,
      'paidAmount': paidAmount,
      'discount': discount,
      'fine': fine,
      'status': status.name,
      'paymentMethod': paymentMethod?.name,
      'transactionId': transactionId,
      'receiptNumber': receiptNumber,
      'remarks': remarks,
      'collectedById': collectedById,
      'collectedByName': collectedByName,
      'dueDate': dueDate?.toIso8601String(),
      'paidDate': paidDate?.toIso8601String(),
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  FeeRecordModel copyWith({
    String? id,
    String? studentId,
    String? studentName,
    String? studentRollNumber,
    String? feeStructureId,
    String? feeName,
    double? amount,
    double? paidAmount,
    double? discount,
    double? fine,
    FeePaymentStatus? status,
    FeePaymentMethod? paymentMethod,
    String? transactionId,
    String? receiptNumber,
    String? remarks,
    String? collectedById,
    String? collectedByName,
    DateTime? dueDate,
    DateTime? paidDate,
    DateTime? createdAt,
  }) {
    return FeeRecordModel(
      id: id ?? this.id,
      studentId: studentId ?? this.studentId,
      studentName: studentName ?? this.studentName,
      studentRollNumber: studentRollNumber ?? this.studentRollNumber,
      feeStructureId: feeStructureId ?? this.feeStructureId,
      feeName: feeName ?? this.feeName,
      amount: amount ?? this.amount,
      paidAmount: paidAmount ?? this.paidAmount,
      discount: discount ?? this.discount,
      fine: fine ?? this.fine,
      status: status ?? this.status,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      transactionId: transactionId ?? this.transactionId,
      receiptNumber: receiptNumber ?? this.receiptNumber,
      remarks: remarks ?? this.remarks,
      collectedById: collectedById ?? this.collectedById,
      collectedByName: collectedByName ?? this.collectedByName,
      dueDate: dueDate ?? this.dueDate,
      paidDate: paidDate ?? this.paidDate,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  double get balance => amount - paidAmount - (discount ?? 0.0) + (fine ?? 0.0);
  bool get isFullyPaid => balance <= 0;

  static FeePaymentStatus _parseStatus(String? value) {
    switch (value?.toLowerCase()) {
      case 'paid':
        return FeePaymentStatus.paid;
      case 'partial':
        return FeePaymentStatus.partial;
      case 'overdue':
        return FeePaymentStatus.overdue;
      case 'waived':
        return FeePaymentStatus.waived;
      case 'refunded':
        return FeePaymentStatus.refunded;
      default:
        return FeePaymentStatus.pending;
    }
  }

  static FeePaymentMethod? _parsePaymentMethod(String? value) {
    if (value == null) return null;
    switch (value.toLowerCase()) {
      case 'bank_transfer':
      case 'banktransfer':
        return FeePaymentMethod.bankTransfer;
      case 'cheque':
        return FeePaymentMethod.cheque;
      case 'online':
        return FeePaymentMethod.online;
      case 'other':
        return FeePaymentMethod.other;
      default:
        return FeePaymentMethod.cash;
    }
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  @override
  List<Object?> get props => [id, studentId, feeStructureId, status, amount, paidAmount];
}
