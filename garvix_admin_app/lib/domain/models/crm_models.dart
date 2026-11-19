class LeadItem {
  const LeadItem({
    required this.id,
    required this.name,
    required this.company,
    required this.email,
    required this.phone,
    required this.solution,
    required this.message,
    required this.status,
    required this.createdAt,
  });

  final String id;
  final String name;
  final String? company;
  final String email;
  final String phone;
  final String solution;
  final String message;
  final String status;
  final DateTime createdAt;

  factory LeadItem.fromJson(Map<String, dynamic> json) {
    return LeadItem(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      company: json['company']?.toString(),
      email: (json['email'] ?? '').toString(),
      phone: (json['phone'] ?? '').toString(),
      solution: (json['solution'] ?? '').toString(),
      message: (json['message'] ?? '').toString(),
      status: (json['status'] ?? 'NEW').toString(),
      createdAt:
          DateTime.tryParse((json['createdAt'] ?? '').toString()) ?? DateTime.now(),
    );
  }
}

class ClientItem {
  const ClientItem({
    required this.id,
    required this.companyName,
    required this.contactPerson,
    required this.email,
    required this.phone,
    required this.gstin,
    required this.state,
    required this.stateCode,
    required this.billingAddress,
    required this.invoiceCount,
    required this.quotationCount,
    required this.totalBilled,
    required this.totalDue,
  });

  final String id;
  final String companyName;
  final String? contactPerson;
  final String? email;
  final String phone;
  final String? gstin;
  final String state;
  final String stateCode;
  final String? billingAddress;
  final int invoiceCount;
  final int quotationCount;
  final double totalBilled;
  final double totalDue;

  bool get isHaryana => stateCode == '06';

  factory ClientItem.fromJson(Map<String, dynamic> json) {
    return ClientItem(
      id: (json['id'] ?? '').toString(),
      companyName: (json['companyName'] ?? '').toString(),
      contactPerson: json['contactPerson']?.toString(),
      email: json['email']?.toString(),
      phone: (json['phone'] ?? '').toString(),
      gstin: json['gstin']?.toString(),
      state: (json['state'] ?? 'Haryana').toString(),
      stateCode: (json['stateCode'] ?? '06').toString(),
      billingAddress: json['billingAddress']?.toString(),
      invoiceCount: (json['invoiceCount'] is num)
          ? (json['invoiceCount'] as num).toInt()
          : 0,
      quotationCount: (json['quotationCount'] is num)
          ? (json['quotationCount'] as num).toInt()
          : 0,
      totalBilled: (json['totalBilled'] is num)
          ? (json['totalBilled'] as num).toDouble()
          : 0,
      totalDue: (json['totalDue'] is num)
          ? (json['totalDue'] as num).toDouble()
          : 0,
    );
  }
}

class InvoiceItem {
  const InvoiceItem({
    required this.id,
    required this.invoiceNumber,
    required this.token,
    required this.type,
    required this.customerName,
    required this.customerPhone,
    required this.subtotal,
    required this.cgstAmount,
    required this.sgstAmount,
    required this.igstAmount,
    required this.totalAmount,
    required this.amountPaid,
    required this.balanceDue,
    required this.paymentStatus,
    required this.portalUrl,
    required this.createdAt,
  });

  final String id;
  final String invoiceNumber;
  final String token;
  final String type;
  final String customerName;
  final String customerPhone;
  final double subtotal;
  final double cgstAmount;
  final double sgstAmount;
  final double igstAmount;
  final double totalAmount;
  final double amountPaid;
  final double balanceDue;
  final String paymentStatus;
  final String portalUrl;
  final DateTime createdAt;

  factory InvoiceItem.fromJson(Map<String, dynamic> json) {
    return InvoiceItem(
      id: (json['id'] ?? '').toString(),
      invoiceNumber: (json['invoiceNumber'] ?? '').toString(),
      token: (json['token'] ?? '').toString(),
      type: (json['type'] ?? 'TAX_INVOICE').toString(),
      customerName: (json['customerName'] ?? '').toString(),
      customerPhone: (json['customerPhone'] ?? '').toString(),
      subtotal: (json['subtotal'] is num)
          ? (json['subtotal'] as num).toDouble()
          : 0,
      cgstAmount: (json['cgstAmount'] is num)
          ? (json['cgstAmount'] as num).toDouble()
          : 0,
      sgstAmount: (json['sgstAmount'] is num)
          ? (json['sgstAmount'] as num).toDouble()
          : 0,
      igstAmount: (json['igstAmount'] is num)
          ? (json['igstAmount'] as num).toDouble()
          : 0,
      totalAmount: (json['totalAmount'] is num)
          ? (json['totalAmount'] as num).toDouble()
          : 0,
      amountPaid: (json['amountPaid'] is num)
          ? (json['amountPaid'] as num).toDouble()
          : 0,
      balanceDue: (json['balanceDue'] is num)
          ? (json['balanceDue'] as num).toDouble()
          : 0,
      paymentStatus: (json['paymentStatus'] ?? 'UNPAID').toString(),
      portalUrl: (json['portalUrl'] ?? '').toString(),
      createdAt:
          DateTime.tryParse((json['createdAt'] ?? '').toString()) ?? DateTime.now(),
    );
  }
}

class QuotationItem {
  const QuotationItem({
    required this.id,
    required this.quoteNumber,
    required this.token,
    required this.customerName,
    required this.customerPhone,
    required this.totalAmount,
    required this.status,
    required this.portalUrl,
    required this.createdAt,
  });

  final String id;
  final String quoteNumber;
  final String token;
  final String customerName;
  final String customerPhone;
  final double totalAmount;
  final String status;
  final String portalUrl;
  final DateTime createdAt;

  factory QuotationItem.fromJson(Map<String, dynamic> json) {
    return QuotationItem(
      id: (json['id'] ?? '').toString(),
      quoteNumber: (json['quoteNumber'] ?? '').toString(),
      token: (json['token'] ?? '').toString(),
      customerName: (json['customerName'] ?? '').toString(),
      customerPhone: (json['customerPhone'] ?? '').toString(),
      totalAmount: (json['totalAmount'] is num)
          ? (json['totalAmount'] as num).toDouble()
          : 0,
      status: (json['status'] ?? 'DRAFT').toString(),
      portalUrl: (json['portalUrl'] ?? '').toString(),
      createdAt:
          DateTime.tryParse((json['createdAt'] ?? '').toString()) ?? DateTime.now(),
    );
  }
}

class EmployeeItem {
  const EmployeeItem({
    required this.id,
    required this.name,
    required this.username,
    required this.email,
    required this.role,
    required this.phone,
    required this.isActive,
  });

  final String id;
  final String name;
  final String username;
  final String email;
  final String role;
  final String? phone;
  final bool isActive;

  factory EmployeeItem.fromJson(Map<String, dynamic> json) {
    return EmployeeItem(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      username: (json['username'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      role: (json['role'] ?? '').toString(),
      phone: json['phone']?.toString(),
      isActive: json['isActive'] != false,
    );
  }
}

class RoleItem {
  const RoleItem({
    required this.id,
    required this.name,
    required this.displayName,
    required this.description,
    required this.permissions,
    required this.isSystem,
  });

  final String id;
  final String name;
  final String displayName;
  final String? description;
  final List<String> permissions;
  final bool isSystem;

  factory RoleItem.fromJson(Map<String, dynamic> json) {
    return RoleItem(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      displayName: (json['displayName'] ?? '').toString(),
      description: json['description']?.toString(),
      permissions: ((json['permissions'] as List?) ?? const [])
          .map((e) => e.toString())
          .toList(),
      isSystem: json['isSystem'] == true,
    );
  }
}
