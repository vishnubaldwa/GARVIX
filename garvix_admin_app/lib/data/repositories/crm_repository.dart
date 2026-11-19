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

  Future<List<InvoiceItem>> fetchInvoices() async {
    final data = await _apiClient.get('/api/admin/invoices');
    return ((data['invoices'] as List?) ?? const [])
        .map((e) => InvoiceItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<QuotationItem>> fetchQuotations() async {
    final data = await _apiClient.get('/api/admin/quotations');
    return ((data['quotations'] as List?) ?? const [])
        .map((e) => QuotationItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
