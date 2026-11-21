class DashboardKpis {
  const DashboardKpis({
    required this.totalInvoiced,
    required this.totalCollected,
    required this.totalReceivables,
    required this.totalItc,
    required this.netProfit,
    required this.invoiceCount,
    required this.clientCount,
    required this.leadCount,
    required this.amcCount,
    required this.lowStockCount,
    required this.vaultDocCount,
  });

  final double totalInvoiced;
  final double totalCollected;
  final double totalReceivables;
  final double totalItc;
  final double netProfit;
  final int invoiceCount;
  final int clientCount;
  final int leadCount;
  final int amcCount;
  final int lowStockCount;
  final int vaultDocCount;

  factory DashboardKpis.fromJson(Map<String, dynamic> json) {
    double toDouble(dynamic v) => (v is num) ? v.toDouble() : double.tryParse('$v') ?? 0;
    int toInt(dynamic v) => (v is num) ? v.toInt() : int.tryParse('$v') ?? 0;

    return DashboardKpis(
      totalInvoiced: toDouble(json['totalInvoiced']),
      totalCollected: toDouble(json['totalCollected']),
      totalReceivables: toDouble(json['totalReceivables']),
      totalItc: toDouble(json['totalItc']),
      netProfit: toDouble(json['netProfit']),
      invoiceCount: toInt(json['invoiceCount']),
      clientCount: toInt(json['clientCount']),
      leadCount: toInt(json['leadCount']),
      amcCount: toInt(json['amcCount']),
      lowStockCount: toInt(json['lowStockCount']),
      vaultDocCount: toInt(json['vaultDocCount']),
    );
  }
}

class DashboardInvoiceSummary {
  const DashboardInvoiceSummary({
    required this.id,
    required this.invoiceNumber,
    required this.token,
    required this.customerName,
    required this.totalAmount,
    required this.balanceDue,
    required this.paymentStatus,
    required this.createdAt,
  });

  final String id;
  final String invoiceNumber;
  final String token;
  final String customerName;
  final double totalAmount;
  final double balanceDue;
  final String paymentStatus;
  final DateTime createdAt;

  String get portalUrl => 'https://garvix.in/portal/invoice/$token';

  factory DashboardInvoiceSummary.fromJson(Map<String, dynamic> json) {
    return DashboardInvoiceSummary(
      id: (json['id'] ?? '').toString(),
      invoiceNumber: (json['invoiceNumber'] ?? '').toString(),
      token: (json['token'] ?? '').toString(),
      customerName: (json['customerName'] ?? '').toString(),
      totalAmount: (json['totalAmount'] is num) ? (json['totalAmount'] as num).toDouble() : 0,
      balanceDue: (json['balanceDue'] is num) ? (json['balanceDue'] as num).toDouble() : 0,
      paymentStatus: (json['paymentStatus'] ?? 'UNPAID').toString(),
      createdAt: DateTime.tryParse((json['createdAt'] ?? '').toString()) ?? DateTime.now(),
    );
  }
}

class LowStockItem {
  const LowStockItem({
    required this.id,
    required this.name,
    required this.currentStock,
    required this.unit,
  });

  final String id;
  final String name;
  final int currentStock;
  final String unit;

  factory LowStockItem.fromJson(Map<String, dynamic> json) {
    return LowStockItem(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      currentStock: (json['currentStock'] is num) ? (json['currentStock'] as num).toInt() : 0,
      unit: (json['unit'] ?? 'PCS').toString(),
    );
  }
}

class DashboardLeadSummary {
  const DashboardLeadSummary({
    required this.id,
    required this.name,
    required this.company,
    required this.phone,
    required this.email,
    required this.solution,
    required this.status,
    required this.createdAt,
  });

  final String id;
  final String name;
  final String? company;
  final String phone;
  final String email;
  final String solution;
  final String status;
  final DateTime createdAt;

  factory DashboardLeadSummary.fromJson(Map<String, dynamic> json) {
    return DashboardLeadSummary(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      company: json['company']?.toString(),
      phone: (json['phone'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      solution: (json['solution'] ?? '').toString(),
      status: (json['status'] ?? 'NEW').toString(),
      createdAt: DateTime.tryParse((json['createdAt'] ?? '').toString()) ?? DateTime.now(),
    );
  }
}

class ComplianceAlertTopItem {
  const ComplianceAlertTopItem({
    required this.key,
    required this.title,
    required this.category,
    required this.dueDate,
    required this.daysRemaining,
    required this.urgency,
    required this.portalName,
    required this.priority,
  });

  final String key;
  final String title;
  final String category;
  final String dueDate;
  final int daysRemaining;
  final String urgency;
  final String portalName;
  final String priority;

  factory ComplianceAlertTopItem.fromJson(Map<String, dynamic> json) {
    return ComplianceAlertTopItem(
      key: (json['key'] ?? '').toString(),
      title: (json['title'] ?? '').toString(),
      category: (json['category'] ?? 'CUSTOM').toString(),
      dueDate: (json['dueDate'] ?? '').toString(),
      daysRemaining: (json['daysRemaining'] is num)
          ? (json['daysRemaining'] as num).toInt()
          : 0,
      urgency: (json['urgency'] ?? 'UPCOMING').toString(),
      portalName: (json['portalName'] ?? '').toString(),
      priority: (json['priority'] ?? 'NORMAL').toString(),
    );
  }
}

class ComplianceDashboardAlert {
  const ComplianceDashboardAlert({
    required this.incorporationDateSet,
    this.incorporationDate,
    required this.gstFilingFrequency,
    required this.overdueCount,
    required this.dueSoonCount,
    required this.pendingTotal,
    required this.topItems,
  });

  final bool incorporationDateSet;
  final String? incorporationDate;
  final String gstFilingFrequency;
  final int overdueCount;
  final int dueSoonCount;
  final int pendingTotal;
  final List<ComplianceAlertTopItem> topItems;

  bool get needsAttention =>
      !incorporationDateSet || overdueCount > 0 || dueSoonCount > 0;

  factory ComplianceDashboardAlert.fromJson(Map<String, dynamic> json) {
    int toInt(dynamic v) => (v is num) ? v.toInt() : int.tryParse('$v') ?? 0;
    return ComplianceDashboardAlert(
      incorporationDateSet: json['incorporationDateSet'] == true,
      incorporationDate: json['incorporationDate']?.toString(),
      gstFilingFrequency: (json['gstFilingFrequency'] ?? 'MONTHLY').toString(),
      overdueCount: toInt(json['overdueCount']),
      dueSoonCount: toInt(json['dueSoonCount']),
      pendingTotal: toInt(json['pendingTotal']),
      topItems: ((json['topItems'] as List?) ?? const [])
          .map(
            (e) => ComplianceAlertTopItem.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    );
  }
}

class DashboardPayload {
  const DashboardPayload({
    required this.kpis,
    required this.lowStockProducts,
    required this.recentInvoices,
    required this.recentLeads,
    this.complianceAlerts,
  });

  final DashboardKpis kpis;
  final List<LowStockItem> lowStockProducts;
  final List<DashboardInvoiceSummary> recentInvoices;
  final List<DashboardLeadSummary> recentLeads;
  final ComplianceDashboardAlert? complianceAlerts;

  factory DashboardPayload.fromJson(Map<String, dynamic> json) {
    return DashboardPayload(
      kpis: DashboardKpis.fromJson(
        (json['kpis'] as Map<String, dynamic>?) ?? const {},
      ),
      lowStockProducts: ((json['lowStockProducts'] as List?) ?? const [])
          .map((e) => LowStockItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      recentInvoices: ((json['recentInvoices'] as List?) ?? const [])
          .map((e) => DashboardInvoiceSummary.fromJson(e as Map<String, dynamic>))
          .toList(),
      recentLeads: ((json['recentLeads'] as List?) ?? const [])
          .map((e) => DashboardLeadSummary.fromJson(e as Map<String, dynamic>))
          .toList(),
      complianceAlerts: json['complianceAlerts'] is Map<String, dynamic>
          ? ComplianceDashboardAlert.fromJson(
              json['complianceAlerts'] as Map<String, dynamic>,
            )
          : null,
    );
  }
}
