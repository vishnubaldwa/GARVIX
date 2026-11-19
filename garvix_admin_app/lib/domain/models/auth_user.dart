class AuthUser {
  const AuthUser({
    required this.id,
    required this.username,
    required this.email,
    required this.name,
    required this.role,
    required this.permissions,
  });

  final String id;
  final String username;
  final String email;
  final String name;
  final String role;
  final List<String> permissions;

  bool get isFullAdmin {
    final upper = role.toUpperCase();
    return upper == 'SUPER_ADMIN' || upper == 'ADMIN';
  }

  bool get isDocumentViewerOnly => role.toUpperCase() == 'DOCUMENT_VIEWER';

  bool hasPermission(String code) {
    if (isFullAdmin) return true;
    return permissions.contains(code);
  }

  bool get canManageVault => isFullAdmin || hasPermission('CAN_MANAGE_DOCUMENTS');
  bool get canViewVault => isFullAdmin || hasPermission('CAN_VIEW_DOCUMENTS');
  bool get canViewLeads => isFullAdmin || hasPermission('CAN_VIEW_LEADS');
  bool get canViewBilling =>
      isFullAdmin ||
      hasPermission('CAN_MANAGE_INVOICES') ||
      hasPermission('CAN_CREATE_QUOTATION') ||
      hasPermission('CAN_CREATE_CLIENT');
  bool get canManageTeam => isFullAdmin || hasPermission('CAN_MANAGE_TEAM');

  String get initials {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty || parts.first.isEmpty) return 'G';
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    final rawPerms = json['permissions'];
    final perms = rawPerms is List
        ? rawPerms.map((e) => e.toString()).toList()
        : <String>[];
    return AuthUser(
      id: (json['id'] ?? '').toString(),
      username: (json['username'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      name: (json['name'] ?? 'Staff Member').toString(),
      role: (json['role'] ?? 'USER').toString(),
      permissions: perms,
    );
  }
}
