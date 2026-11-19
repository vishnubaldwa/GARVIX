import 'package:flutter/foundation.dart';

import '../../../../data/repositories/crm_repository.dart';
import '../../../../data/repositories/erp_repository.dart';
import '../../../../domain/models/crm_models.dart';
import '../../../../domain/models/erp_models.dart';

class BillingViewModel extends ChangeNotifier {
  BillingViewModel({
    required this._crmRepository,
    required this._erpRepository,
  });

  final CrmRepository _crmRepository;
  final ErpRepository _erpRepository;

  List<InvoiceItem> _invoices = const [];
  List<InvoiceItem> get invoices => _invoices;

  List<InvoiceItem> get outstandingInvoices =>
      _invoices.where((i) => i.balanceDue > 0 || i.paymentStatus != 'PAID').toList();

  double get totalOutstanding =>
      outstandingInvoices.fold<double>(0, (sum, i) => sum + i.balanceDue);

  List<QuotationItem> _quotations = const [];
  List<QuotationItem> get quotations => _quotations;

  List<ClientItem> _clients = const [];
  List<ClientItem> get clients => _clients;

  List<ProductItem> _products = const [];
  List<ProductItem> get products => _products;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  bool _isMutating = false;
  bool get isMutating => _isMutating;

  String? _error;
  String? get error => _error;

  Future<void> loadAll() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final results = await Future.wait([
        _crmRepository.fetchInvoices().catchError((_) => <InvoiceItem>[]),
        _crmRepository.fetchQuotations().catchError((_) => <QuotationItem>[]),
        _crmRepository.fetchClients().catchError((_) => <ClientItem>[]),
        _erpRepository.fetchProducts().catchError((_) => <ProductItem>[]),
      ]);
      _invoices = results[0] as List<InvoiceItem>;
      _quotations = results[1] as List<QuotationItem>;
      _clients = results[2] as List<ClientItem>;
      _products = results[3] as List<ProductItem>;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
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
    _isMutating = true;
    notifyListeners();
    try {
      await _crmRepository.createClient(
        companyName: companyName,
        contactPerson: contactPerson,
        phone: phone,
        email: email,
        gstin: gstin,
        state: state,
        stateCode: stateCode,
        billingAddress: billingAddress,
      );
      await loadAll();
    } finally {
      _isMutating = false;
      notifyListeners();
    }
  }

  Future<void> createQuotation({
    required String customerId,
    required int validUntilDays,
    String? terms,
    required List<Map<String, dynamic>> items,
  }) async {
    _isMutating = true;
    notifyListeners();
    try {
      await _crmRepository.createQuotation(
        customerId: customerId,
        validUntilDays: validUntilDays,
        terms: terms,
        items: items,
      );
      await loadAll();
    } finally {
      _isMutating = false;
      notifyListeners();
    }
  }

  Future<void> convertQuotation(String quotationId) async {
    _isMutating = true;
    notifyListeners();
    try {
      await _crmRepository.convertQuotationToInvoice(quotationId);
      await loadAll();
    } finally {
      _isMutating = false;
      notifyListeners();
    }
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
    _isMutating = true;
    notifyListeners();
    try {
      await _crmRepository.createInvoice(
        customerId: customerId,
        invoiceType: invoiceType,
        ewayBillNo: ewayBillNo,
        transporterName: transporterName,
        vehicleNo: vehicleNo,
        terms: terms,
        items: items,
      );
      await loadAll();
    } finally {
      _isMutating = false;
      notifyListeners();
    }
  }

  Future<void> recordPayment({
    required String invoiceId,
    required double amount,
    required String paymentMode,
    String? referenceNumber,
    String? notes,
  }) async {
    _isMutating = true;
    notifyListeners();
    try {
      await _crmRepository.recordInvoicePayment(
        invoiceId: invoiceId,
        amount: amount,
        paymentMode: paymentMode,
        referenceNumber: referenceNumber,
        notes: notes,
      );
      await loadAll();
    } finally {
      _isMutating = false;
      notifyListeners();
    }
  }
}
