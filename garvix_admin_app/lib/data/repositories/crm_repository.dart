import '../../domain/models/crm_models.dart';
import '../services/api_client.dart';

class CrmRepository {
  CrmRepository({required this._apiClient});

  final ApiClient _apiClient;

  Future<List<LeadItem>> fetchLeads({String status = 'ALL'}) async {
    final query = status == 'ALL' ? '' : '?status=$status';
    final data = await _apiClient.get('/api/admin/leads$query');
    return ((data['leads'] as List?) ?? const [])
        .map((e) => LeadItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> updateLeadStatus({
    required String leadId,
    required String status,
  }) async {
    await _apiClient.post(
      '/api/admin/leads/update',
      body: {'id': leadId, 'status': status},
    );
  }

  Future<List<ClientItem>> fetchClients() async {
    final data = await _apiClient.get('/api/admin/clients');
    return ((data['clients'] as List?) ?? const [])
        .map((e) => ClientItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> createClient({
    required String companyName,
    String? contactPerson,
    required String phone,
    String? email,
    String? gstin,
    required String state,
    required String stateCode,
    String? billingAddress,
  }) async {
    await _apiClient.post(
      '/api/admin/clients/create',
      body: {
        'companyName': companyName,
        'contactPerson': contactPerson,
        'phone': phone,
        'email': email,
        'gstin': gstin,
        'state': state,
        'stateCode': stateCode,
        'billingAddress': billingAddress,
        'isB2B': gstin != null && gstin.trim().isNotEmpty,
      },
    );
  }

  Future<List<InvoiceItem>> fetchInvoices() async {
    final data = await _apiClient.get('/api/admin/invoices');
    return ((data['invoices'] as List?) ?? const [])
        .map((e) => InvoiceItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> createInvoice({
    required String customerId,
    required String invoiceType,
    String? ewayBillNo,
    String? transporterName,
    String? vehicleNo,
    String? terms,
    required List<Map<String, dynamic>> items,
  }) async {
    await _apiClient.post(
      '/api/admin/invoices/create',
      body: {
        'customerId': customerId,
        'invoiceType': invoiceType,
        'ewayBillNo': ewayBillNo,
        'transporterName': transporterName,
        'vehicleNo': vehicleNo,
        'terms': terms,
        'items': items,
      },
    );
  }

  Future<void> recordInvoicePayment({
    required String invoiceId,
    required double amount,
    required String paymentMode,
    String? referenceNumber,
    String? notes,
  }) async {
    await _apiClient.post(
      '/api/admin/invoices/payment',
      body: {
        'invoiceId': invoiceId,
        'amount': amount,
        'paymentMode': paymentMode,
        'referenceNumber': referenceNumber,
        'notes': notes,
      },
    );
  }

  Future<List<QuotationItem>> fetchQuotations() async {
    final data = await _apiClient.get('/api/admin/quotations');
    return ((data['quotations'] as List?) ?? const [])
        .map((e) => QuotationItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> createQuotation({
    required String customerId,
    required int validUntilDays,
    String? terms,
    required List<Map<String, dynamic>> items,
  }) async {
    await _apiClient.post(
      '/api/admin/quotations/create',
      body: {
        'customerId': customerId,
        'validUntilDays': validUntilDays,
        'terms': terms,
        'items': items,
      },
    );
  }

  Future<void> convertQuotationToInvoice(String quotationId) async {
    await _apiClient.post(
      '/api/admin/quotations/convert',
      body: {'quotationId': quotationId},
    );
  }
}
