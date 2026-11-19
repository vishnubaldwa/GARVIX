import 'dart:io';

import '../../domain/models/erp_models.dart';
import '../services/api_client.dart';

class ErpRepository {
  ErpRepository({required this._apiClient});

  final ApiClient _apiClient;

  // --- Delivery Challans ---
  Future<List<ChallanItem>> fetchChallans() async {
    final data = await _apiClient.get('/api/admin/challans');
    return ((data['challans'] as List?) ?? const [])
        .map((e) => ChallanItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> createChallan({
    required String customerId,
    required String challanType,
    required String reason,
    String? transporterName,
    String? vehicleNumber,
    String? notes,
    required List<Map<String, dynamic>> items,
  }) async {
    await _apiClient.post(
      '/api/admin/challans/create',
      body: {
        'customerId': customerId,
        'challanType': challanType,
        'reason': reason,
        'transporterName': transporterName,
        'vehicleNumber': vehicleNumber,
        'notes': notes,
        'items': items,
      },
    );
  }

  // --- Inventory & Serials ---
  Future<List<ProductItem>> fetchProducts() async {
    final data = await _apiClient.get('/api/admin/inventory');
    return ((data['products'] as List?) ?? const [])
        .map((e) => ProductItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> createProduct({
    required String name,
    required String sku,
    required String category,
    required String hsnCode,
    String? description,
    required double purchasePrice,
    required double sellingPrice,
    required String unit,
    required int currentStock,
    required int minStockAlert,
  }) async {
    await _apiClient.post(
      '/api/admin/products/create',
      body: {
        'name': name,
        'sku': sku,
        'category': category,
        'hsnCode': hsnCode,
        'description': description,
        'purchasePrice': purchasePrice,
        'sellingPrice': sellingPrice,
        'unit': unit,
        'currentStock': currentStock,
        'minStockAlert': minStockAlert,
      },
    );
  }

  Future<List<SerialItem>> fetchSerials() async {
    final data = await _apiClient.get('/api/admin/inventory/serials');
    return ((data['serials'] as List?) ?? const [])
        .map((e) => SerialItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  // --- AMC & Service Desk ---
  Future<({List<AmcContractItem> contracts, List<ServiceTicketItem> tickets})>
      fetchAmcAndTickets() async {
    final data = await _apiClient.get('/api/admin/amc');
    final contracts = ((data['contracts'] as List?) ?? const [])
        .map((e) => AmcContractItem.fromJson(e as Map<String, dynamic>))
        .toList();
    final tickets = ((data['tickets'] as List?) ?? const [])
        .map((e) => ServiceTicketItem.fromJson(e as Map<String, dynamic>))
        .toList();
    return (contracts: contracts, tickets: tickets);
  }

  // --- Expenses ---
  Future<({double totalExpenses, List<ExpenseItem> expenses})>
      fetchExpenses() async {
    final data = await _apiClient.get('/api/admin/expenses');
    final total = (data['totalExpenses'] is num)
        ? (data['totalExpenses'] as num).toDouble()
        : 0.0;
    final list = ((data['expenses'] as List?) ?? const [])
        .map((e) => ExpenseItem.fromJson(e as Map<String, dynamic>))
        .toList();
    return (totalExpenses: total, expenses: list);
  }

  Future<void> createExpense({
    required String category,
    required double amount,
    required String description,
    required String paymentMode,
  }) async {
    await _apiClient.post(
      '/api/admin/expenses/create',
      body: {
        'category': category,
        'amount': amount,
        'description': description,
        'paymentMode': paymentMode,
      },
    );
  }

  // --- Purchases & ITC ---
  Future<({double totalPurchases, double totalItc, List<PurchaseItem> purchases})>
      fetchPurchases() async {
    final data = await _apiClient.get('/api/admin/purchases');
    final totalPurchases = (data['totalPurchases'] is num)
        ? (data['totalPurchases'] as num).toDouble()
        : 0.0;
    final totalItc = (data['totalItc'] is num)
        ? (data['totalItc'] as num).toDouble()
        : 0.0;
    final list = ((data['purchases'] as List?) ?? const [])
        .map((e) => PurchaseItem.fromJson(e as Map<String, dynamic>))
        .toList();
    return (
      totalPurchases: totalPurchases,
      totalItc: totalItc,
      purchases: list,
    );
  }

  // --- 1-Click CA GST Return Export (.xlsx) ---
  Future<File> downloadGstReturn({required String type}) {
    final stamp = DateTime.now().toIso8601String().substring(0, 7);
    final filename = type == 'gstr3b'
        ? 'GARVIX_GSTR3B_Summary_$stamp.xlsx'
        : 'GARVIX_GSTR1_Return_$stamp.xlsx';
    return _apiClient.downloadBinaryFile(
      '/api/admin/gst-export?type=$type',
      suggestedFileName: filename,
    );
  }

  // --- Company Settings & Security ---
  Future<CompanySettingsModel> fetchSettings() async {
    final data = await _apiClient.get('/api/admin/settings');
    return CompanySettingsModel.fromJson(
      (data['settings'] as Map<String, dynamic>?) ?? const {},
    );
  }

  Future<CompanySettingsModel> updateSettings(
    CompanySettingsModel settings,
  ) async {
    final data = await _apiClient.post(
      '/api/admin/settings',
      body: settings.toJson(),
    );
    return CompanySettingsModel.fromJson(
      (data['settings'] as Map<String, dynamic>?) ?? settings.toJson(),
    );
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    await _apiClient.post(
      '/api/admin/auth/change-password',
      body: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      },
    );
  }

  // --- Authorized Signatory Signature ---
  Future<List<int>> fetchSignatureBytes() {
    return _apiClient.fetchBinaryBytes(
      '/api/public/signature?v=${DateTime.now().millisecondsSinceEpoch}',
    );
  }

  Future<void> uploadSignature(File file) async {
    await _apiClient.uploadMultipartFiles(
      '/api/admin/settings/signature',
      fields: const {},
      files: [file],
      fileFieldName: 'file',
    );
  }

  // --- Super-Admin-Only Permanent Delete ---
  Future<void> deleteRecord({
    required String entity,
    required String id,
  }) async {
    await _apiClient.delete(
      '/api/admin/records?entity=${Uri.encodeComponent(entity)}&id=${Uri.encodeComponent(id)}',
    );
  }

  // --- Audit Security Logs ---
  Future<List<AuditLogItem>> fetchAuditLogs() async {
    final data = await _apiClient.get('/api/admin/audit');
    return ((data['logs'] as List?) ?? const [])
        .map((e) => AuditLogItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
