import 'package:flutter/foundation.dart';

import '../../../../data/repositories/crm_repository.dart';
import '../../../../domain/models/crm_models.dart';

class BillingViewModel extends ChangeNotifier {
  BillingViewModel({required this._repository});

  final CrmRepository _repository;

  List<InvoiceItem> _invoices = const [];
  List<InvoiceItem> get invoices => _invoices;

  List<QuotationItem> _quotations = const [];
  List<QuotationItem> get quotations => _quotations;

  List<ClientItem> _clients = const [];
  List<ClientItem> get clients => _clients;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  Future<void> loadAll() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final results = await Future.wait([
        _repository.fetchInvoices().catchError((_) => <InvoiceItem>[]),
        _repository.fetchQuotations().catchError((_) => <QuotationItem>[]),
        _repository.fetchClients().catchError((_) => <ClientItem>[]),
      ]);
      _invoices = results[0] as List<InvoiceItem>;
      _quotations = results[1] as List<QuotationItem>;
      _clients = results[2] as List<ClientItem>;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
