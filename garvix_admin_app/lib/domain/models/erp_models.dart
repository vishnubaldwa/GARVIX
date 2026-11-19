class ProductItem {
  const ProductItem({
    required this.id,
    required this.name,
    required this.sku,
    required this.category,
    required this.hsnCode,
    required this.description,
    required this.purchasePrice,
    required this.sellingPrice,
    required this.unit,
    required this.currentStock,
    required this.minStockAlert,
    required this.serialCount,
  });

  final String id;
  final String name;
  final String sku;
  final String category;
  final String hsnCode;
  final String? description;
  final double purchasePrice;
  final double sellingPrice;
  final String unit;
  final int currentStock;
  final int minStockAlert;
  final int serialCount;

  bool get isLowStock => currentStock <= minStockAlert;

  factory ProductItem.fromJson(Map<String, dynamic> json) {
    return ProductItem(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      sku: (json['sku'] ?? '').toString(),
      category: (json['category'] ?? 'HARDWARE_READER').toString(),
      hsnCode: (json['hsnCode'] ?? '8471').toString(),
      description: json['description']?.toString(),
      purchasePrice: (json['purchasePrice'] is num)
          ? (json['purchasePrice'] as num).toDouble()
          : 0,
      sellingPrice: (json['sellingPrice'] is num)
          ? (json['sellingPrice'] as num).toDouble()
          : 0,
      unit: (json['unit'] ?? 'PCS').toString(),
      currentStock: (json['currentStock'] is num)
          ? (json['currentStock'] as num).toInt()
          : 0,
      minStockAlert: (json['minStockAlert'] is num)
          ? (json['minStockAlert'] as num).toInt()
          : 5,
      serialCount: (json['serialCount'] is num)
          ? (json['serialCount'] as num).toInt()
          : 0,
    );
  }
}

class SerialItem {
  const SerialItem({
    required this.id,
    required this.serialNumber,
    required this.imei,
    required this.productName,
    required this.productSku,
    required this.status,
    required this.assignedDoc,
    required this.assignedClient,
    required this.warrantyExpiry,
    required this.createdAt,
  });

  final String id;
  final String serialNumber;
  final String? imei;
  final String productName;
  final String productSku;
  final String status;
  final String? assignedDoc;
  final String? assignedClient;
  final DateTime? warrantyExpiry;
  final DateTime createdAt;

  factory SerialItem.fromJson(Map<String, dynamic> json) {
    return SerialItem(
      id: (json['id'] ?? '').toString(),
      serialNumber: (json['serialNumber'] ?? '').toString(),
      imei: json['imei']?.toString(),
      productName: (json['productName'] ?? '').toString(),
      productSku: (json['productSku'] ?? '').toString(),
      status: (json['status'] ?? 'IN_STOCK').toString(),
      assignedDoc: json['assignedDoc']?.toString(),
      assignedClient: json['assignedClient']?.toString(),
      warrantyExpiry: json['warrantyExpiry'] != null
          ? DateTime.tryParse(json['warrantyExpiry'].toString())
          : null,
      createdAt:
          DateTime.tryParse((json['createdAt'] ?? '').toString()) ?? DateTime.now(),
    );
  }
}

class ChallanLineItem {
  const ChallanLineItem({
    required this.description,
    required this.hsnCode,
    required this.quantity,
    this.serialNumbersList,
  });

  final String description;
  final String hsnCode;
  final double quantity;
  final String? serialNumbersList;

  factory ChallanLineItem.fromJson(Map<String, dynamic> json) {
    return ChallanLineItem(
      description: (json['description'] ?? '').toString(),
      hsnCode: (json['hsnCode'] ?? '8471').toString(),
      quantity: (json['quantity'] is num)
          ? (json['quantity'] as num).toDouble()
          : 1,
      serialNumbersList: json['serialNumbersList']?.toString(),
    );
  }
}

class ChallanItem {
  const ChallanItem({
    required this.id,
    required this.challanNumber,
    required this.customerName,
    required this.customerPhone,
    required this.challanType,
    required this.reason,
    required this.transporterName,
    required this.vehicleNumber,
    required this.status,
    required this.itemCount,
    required this.totalQuantity,
    required this.items,
    required this.dispatchDate,
  });

  final String id;
  final String challanNumber;
  final String customerName;
  final String customerPhone;
  final String challanType;
  final String reason;
  final String? transporterName;
  final String? vehicleNumber;
  final String status;
  final int itemCount;
  final double totalQuantity;
  final List<ChallanLineItem> items;
  final DateTime dispatchDate;

  factory ChallanItem.fromJson(Map<String, dynamic> json) {
    return ChallanItem(
      id: (json['id'] ?? '').toString(),
      challanNumber: (json['challanNumber'] ?? '').toString(),
      customerName: (json['customerName'] ?? '').toString(),
      customerPhone: (json['customerPhone'] ?? '').toString(),
      challanType: (json['challanType'] ?? 'RETURNABLE').toString(),
      reason: (json['reason'] ?? 'DEMO_TESTING').toString(),
      transporterName: json['transporterName']?.toString(),
      vehicleNumber: json['vehicleNumber']?.toString(),
      status: (json['status'] ?? 'OPEN').toString(),
      itemCount:
          (json['itemCount'] is num) ? (json['itemCount'] as num).toInt() : 0,
      totalQuantity: (json['totalQuantity'] is num)
          ? (json['totalQuantity'] as num).toDouble()
          : 0,
      items: ((json['items'] as List?) ?? const [])
          .map((e) => ChallanLineItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      dispatchDate:
          DateTime.tryParse((json['dispatchDate'] ?? json['createdAt'] ?? '').toString()) ??
              DateTime.now(),
    );
  }
}

class AmcContractItem {
  const AmcContractItem({
    required this.id,
    required this.contractNumber,
    required this.customerName,
    required this.customerPhone,
    required this.title,
    required this.startDate,
    required this.endDate,
    required this.contractValue,
    required this.visitFrequency,
    required this.status,
  });

  final String id;
  final String contractNumber;
  final String customerName;
  final String customerPhone;
  final String title;
  final DateTime startDate;
  final DateTime endDate;
  final double contractValue;
  final String visitFrequency;
  final String status;

  int get daysRemaining => endDate.difference(DateTime.now()).inDays;

  factory AmcContractItem.fromJson(Map<String, dynamic> json) {
    return AmcContractItem(
      id: (json['id'] ?? '').toString(),
      contractNumber: (json['contractNumber'] ?? '').toString(),
      customerName: (json['customerName'] ?? '').toString(),
      customerPhone: (json['customerPhone'] ?? '').toString(),
      title: (json['title'] ?? '').toString(),
      startDate:
          DateTime.tryParse((json['startDate'] ?? '').toString()) ?? DateTime.now(),
      endDate:
          DateTime.tryParse((json['endDate'] ?? '').toString()) ?? DateTime.now(),
      contractValue: (json['contractValue'] is num)
          ? (json['contractValue'] as num).toDouble()
          : 0,
      visitFrequency: (json['visitFrequency'] ?? 'QUARTERLY').toString(),
      status: (json['status'] ?? 'ACTIVE').toString(),
    );
  }
}

class ServiceTicketItem {
  const ServiceTicketItem({
    required this.id,
    required this.ticketNumber,
    required this.customerName,
    required this.customerPhone,
    required this.issueTitle,
    required this.description,
    required this.priority,
    required this.status,
    required this.assignedTo,
    required this.resolutionNotes,
    required this.createdAt,
  });

  final String id;
  final String ticketNumber;
  final String customerName;
  final String customerPhone;
  final String issueTitle;
  final String description;
  final String priority;
  final String status;
  final String? assignedTo;
  final String? resolutionNotes;
  final DateTime createdAt;

  factory ServiceTicketItem.fromJson(Map<String, dynamic> json) {
    return ServiceTicketItem(
      id: (json['id'] ?? '').toString(),
      ticketNumber: (json['ticketNumber'] ?? '').toString(),
      customerName: (json['customerName'] ?? '').toString(),
      customerPhone: (json['customerPhone'] ?? '').toString(),
      issueTitle: (json['issueTitle'] ?? '').toString(),
      description: (json['description'] ?? '').toString(),
      priority: (json['priority'] ?? 'MEDIUM').toString(),
      status: (json['status'] ?? 'OPEN').toString(),
      assignedTo: json['assignedTo']?.toString(),
      resolutionNotes: json['resolutionNotes']?.toString(),
      createdAt:
          DateTime.tryParse((json['createdAt'] ?? '').toString()) ?? DateTime.now(),
    );
  }
}

class ExpenseItem {
  const ExpenseItem({
    required this.id,
    required this.expenseDate,
    required this.category,
    required this.amount,
    required this.description,
    required this.paymentMode,
  });

  final String id;
  final DateTime expenseDate;
  final String category;
  final double amount;
  final String description;
  final String paymentMode;

  factory ExpenseItem.fromJson(Map<String, dynamic> json) {
    return ExpenseItem(
      id: (json['id'] ?? '').toString(),
      expenseDate: DateTime.tryParse(
            (json['expenseDate'] ?? json['createdAt'] ?? '').toString(),
          ) ??
          DateTime.now(),
      category: (json['category'] ?? 'MISC').toString(),
      amount:
          (json['amount'] is num) ? (json['amount'] as num).toDouble() : 0,
      description: (json['description'] ?? '').toString(),
      paymentMode: (json['paymentMode'] ?? 'UPI').toString(),
    );
  }
}

class PurchaseItem {
  const PurchaseItem({
    required this.id,
    required this.billNumber,
    required this.vendorName,
    required this.vendorGstin,
    required this.vendorState,
    required this.billDate,
    required this.subtotal,
    required this.totalTax,
    required this.totalAmount,
    required this.itcEligible,
    required this.paymentStatus,
  });

  final String id;
  final String billNumber;
  final String vendorName;
  final String? vendorGstin;
  final String? vendorState;
  final DateTime billDate;
  final double subtotal;
  final double totalTax;
  final double totalAmount;
  final bool itcEligible;
  final String paymentStatus;

  factory PurchaseItem.fromJson(Map<String, dynamic> json) {
    return PurchaseItem(
      id: (json['id'] ?? '').toString(),
      billNumber: (json['billNumber'] ?? '').toString(),
      vendorName: (json['vendorName'] ?? '').toString(),
      vendorGstin: json['vendorGstin']?.toString(),
      vendorState: json['vendorState']?.toString(),
      billDate:
          DateTime.tryParse((json['billDate'] ?? '').toString()) ?? DateTime.now(),
      subtotal: (json['subtotal'] is num)
          ? (json['subtotal'] as num).toDouble()
          : 0,
      totalTax: (json['totalTax'] is num)
          ? (json['totalTax'] as num).toDouble()
          : 0,
      totalAmount: (json['totalAmount'] is num)
          ? (json['totalAmount'] as num).toDouble()
          : 0,
      itcEligible: json['itcEligible'] != false,
      paymentStatus: (json['paymentStatus'] ?? 'PENDING').toString(),
    );
  }
}

class AuditLogItem {
  const AuditLogItem({
    required this.id,
    required this.username,
    required this.action,
    required this.entityType,
    required this.details,
    required this.createdAt,
  });

  final String id;
  final String username;
  final String action;
  final String entityType;
  final String details;
  final DateTime createdAt;

  factory AuditLogItem.fromJson(Map<String, dynamic> json) {
    return AuditLogItem(
      id: (json['id'] ?? '').toString(),
      username: (json['username'] ?? 'System').toString(),
      action: (json['action'] ?? '').toString(),
      entityType: (json['entityType'] ?? '').toString(),
      details: (json['details'] ?? '').toString(),
      createdAt:
          DateTime.tryParse((json['createdAt'] ?? '').toString()) ?? DateTime.now(),
    );
  }
}

class CompanySettingsModel {
  const CompanySettingsModel({
    required this.name,
    required this.tagline,
    required this.state,
    required this.stateCode,
    required this.gstin,
    required this.email,
    required this.phone,
    required this.address,
    required this.upiId,
    required this.upiName,
    this.bankName,
    this.accountNo,
    this.ifscCode,
  });

  final String name;
  final String tagline;
  final String state;
  final String stateCode;
  final String gstin;
  final String email;
  final String phone;
  final String address;
  final String upiId;
  final String upiName;
  final String? bankName;
  final String? accountNo;
  final String? ifscCode;

  factory CompanySettingsModel.fromJson(Map<String, dynamic> json) {
    return CompanySettingsModel(
      name: (json['name'] ?? 'GARVIX TECHNOLOGIES').toString(),
      tagline: (json['tagline'] ?? '').toString(),
      state: (json['state'] ?? 'Haryana').toString(),
      stateCode: (json['stateCode'] ?? '06').toString(),
      gstin: (json['gstin'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      phone: (json['phone'] ?? '').toString(),
      address: (json['address'] ?? '').toString(),
      upiId: (json['upiId'] ?? '').toString(),
      upiName: (json['upiName'] ?? '').toString(),
      bankName: json['bankName']?.toString(),
      accountNo: json['accountNo']?.toString(),
      ifscCode: json['ifscCode']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'tagline': tagline,
        'state': state,
        'stateCode': stateCode,
        'gstin': gstin,
        'email': email,
        'phone': phone,
        'address': address,
        'upiId': upiId,
        'upiName': upiName,
        'bankName': bankName ?? '',
        'accountNo': accountNo ?? '',
        'ifscCode': ifscCode ?? '',
      };
}

class PermissionDef {
  const PermissionDef({
    required this.code,
    required this.label,
    required this.category,
    required this.description,
  });

  final String code;
  final String label;
  final String category;
  final String description;
}

const List<PermissionDef> kAllPermissions = [
  PermissionDef(
    code: 'CAN_MANAGE_TEAM',
    label: 'Manage Team & Staff',
    category: 'TEAM',
    description: 'Add/edit staff accounts, reset passwords & activate/deactivate.',
  ),
  PermissionDef(
    code: 'CAN_MANAGE_ROLES',
    label: 'Manage Roles & Permissions',
    category: 'SETTINGS',
    description: 'Create custom roles and toggle granular staff permissions.',
  ),
  PermissionDef(
    code: 'CAN_CREATE_CLIENT',
    label: 'Create & Edit Clients',
    category: 'SALES',
    description: 'Add B2B/retail client accounts and GSTIN details.',
  ),
  PermissionDef(
    code: 'CAN_CREATE_QUOTATION',
    label: 'Generate Quotations',
    category: 'SALES',
    description: 'Create sales proposals with auto Haryana/IGST calculation.',
  ),
  PermissionDef(
    code: 'CAN_VIEW_LEADS',
    label: 'View Website Leads',
    category: 'SALES',
    description: 'View inbound enquiries and update sales pipeline status.',
  ),
  PermissionDef(
    code: 'CAN_MANAGE_INVOICES',
    label: 'Manage Invoices & Payments',
    category: 'FINANCE',
    description: 'Issue GST tax invoices, convert quotes, record payments & challans.',
  ),
  PermissionDef(
    code: 'CAN_VIEW_FINANCES',
    label: 'View Turnover, Expenses & GST',
    category: 'FINANCE',
    description: 'Access P&L, expenses, purchases ITC, and 1-click CA GSTR exports.',
  ),
  PermissionDef(
    code: 'CAN_CREATE_PRODUCT',
    label: 'Products & Inventory',
    category: 'OPERATIONS',
    description: 'Add RFID hardware/software SKUs and track serial numbers/IMEI.',
  ),
  PermissionDef(
    code: 'CAN_VIEW_SERVICE',
    label: 'AMC & Service Desk',
    category: 'OPERATIONS',
    description: 'View AMC contracts, expiry alerts, and hardware support tickets.',
  ),
  PermissionDef(
    code: 'CAN_VIEW_DOCUMENTS',
    label: 'View Company Vault',
    category: 'OPERATIONS',
    description: 'View and download permitted incorporation, KYC & banking papers.',
  ),
  PermissionDef(
    code: 'CAN_MANAGE_DOCUMENTS',
    label: 'Manage Vault & Banker Access',
    category: 'SETTINGS',
    description: 'Upload/delete documents, create banker logins & expiring share links.',
  ),
  PermissionDef(
    code: 'CAN_MANAGE_SETTINGS',
    label: 'Manage Company Settings',
    category: 'SETTINGS',
    description: 'Edit legal profile, GSTIN, UPI ID & company bank details.',
  ),
];

const List<Map<String, String>> kIndianStates = [
  {'name': 'Haryana', 'code': '06'},
  {'name': 'Delhi', 'code': '07'},
  {'name': 'Uttar Pradesh', 'code': '09'},
  {'name': 'Rajasthan', 'code': '08'},
  {'name': 'Punjab', 'code': '03'},
  {'name': 'Chandigarh', 'code': '04'},
  {'name': 'Maharashtra', 'code': '27'},
  {'name': 'Gujarat', 'code': '24'},
  {'name': 'Karnataka', 'code': '29'},
  {'name': 'Tamil Nadu', 'code': '33'},
  {'name': 'Telangana', 'code': '36'},
  {'name': 'West Bengal', 'code': '19'},
  {'name': 'Madhya Pradesh', 'code': '23'},
  {'name': 'Bihar', 'code': '10'},
  {'name': 'Uttarakhand', 'code': '05'},
  {'name': 'Himachal Pradesh', 'code': '02'},
  {'name': 'Jammu & Kashmir', 'code': '01'},
  {'name': 'Andhra Pradesh', 'code': '37'},
  {'name': 'Kerala', 'code': '32'},
  {'name': 'Odisha', 'code': '21'},
  {'name': 'Assam', 'code': '18'},
];
