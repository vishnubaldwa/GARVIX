class VaultDocument {
  const VaultDocument({
    required this.id,
    required this.folderId,
    required this.title,
    required this.originalName,
    required this.mimeType,
    required this.fileSize,
    required this.notes,
    required this.expiryDate,
    required this.uploadedBy,
    required this.downloadCount,
    required this.createdAt,
  });

  final String id;
  final String folderId;
  final String title;
  final String originalName;
  final String mimeType;
  final int fileSize;
  final String? notes;
  final DateTime? expiryDate;
  final String? uploadedBy;
  final int downloadCount;
  final DateTime createdAt;

  bool get isImage =>
      mimeType.startsWith('image/') ||
      RegExp(r'\.(jpg|jpeg|png|webp)$', caseSensitive: false).hasMatch(originalName);

  bool get isPdf =>
      mimeType.contains('pdf') || originalName.toLowerCase().endsWith('.pdf');

  String get formattedSize {
    if (fileSize < 1024) return '$fileSize B';
    if (fileSize < 1024 * 1024) return '${(fileSize / 1024).toStringAsFixed(1)} KB';
    return '${(fileSize / (1024 * 1024)).toStringAsFixed(2)} MB';
  }

  factory VaultDocument.fromJson(Map<String, dynamic> json) {
    return VaultDocument(
      id: (json['id'] ?? '').toString(),
      folderId: (json['folderId'] ?? '').toString(),
      title: (json['title'] ?? '').toString(),
      originalName: (json['originalName'] ?? '').toString(),
      mimeType: (json['mimeType'] ?? 'application/octet-stream').toString(),
      fileSize: (json['fileSize'] is num) ? (json['fileSize'] as num).toInt() : 0,
      notes: json['notes']?.toString(),
      expiryDate: json['expiryDate'] != null
          ? DateTime.tryParse(json['expiryDate'].toString())
          : null,
      uploadedBy: json['uploadedBy']?.toString(),
      downloadCount: (json['downloadCount'] is num) ? (json['downloadCount'] as num).toInt() : 0,
      createdAt: DateTime.tryParse((json['createdAt'] ?? '').toString()) ?? DateTime.now(),
    );
  }
}

class VaultFolder {
  const VaultFolder({
    required this.id,
    required this.slug,
    required this.name,
    required this.description,
    required this.icon,
    required this.isDefault,
    required this.documents,
  });

  final String id;
  final String slug;
  final String name;
  final String? description;
  final String icon;
  final bool isDefault;
  final List<VaultDocument> documents;

  factory VaultFolder.fromJson(Map<String, dynamic> json) {
    return VaultFolder(
      id: (json['id'] ?? '').toString(),
      slug: (json['slug'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      description: json['description']?.toString(),
      icon: (json['icon'] ?? 'folder').toString(),
      isDefault: json['isDefault'] == true,
      documents: ((json['documents'] as List?) ?? const [])
          .map((e) => VaultDocument.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class VaultUserAccount {
  const VaultUserAccount({
    required this.id,
    required this.name,
    required this.username,
    required this.email,
    required this.role,
    required this.isActive,
    required this.expiresAt,
    required this.folderIds,
  });

  final String id;
  final String name;
  final String username;
  final String email;
  final String role;
  final bool isActive;
  final DateTime? expiresAt;
  final List<String> folderIds;

  bool get isExpired => expiresAt != null && DateTime.now().isAfter(expiresAt!);
  bool get isAdmin => role.toUpperCase() == 'SUPER_ADMIN' || role.toUpperCase() == 'ADMIN';

  factory VaultUserAccount.fromJson(Map<String, dynamic> json) {
    return VaultUserAccount(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      username: (json['username'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      role: (json['role'] ?? '').toString(),
      isActive: json['isActive'] != false,
      expiresAt: json['expiresAt'] != null
          ? DateTime.tryParse(json['expiresAt'].toString())
          : null,
      folderIds: ((json['folderIds'] as List?) ?? const [])
          .map((e) => e.toString())
          .toList(),
    );
  }
}

class VaultShareLinkItem {
  const VaultShareLinkItem({
    required this.id,
    required this.token,
    required this.label,
    required this.recipient,
    required this.folderIds,
    required this.hasPin,
    required this.expiresAt,
    required this.isActive,
    required this.accessCount,
  });

  final String id;
  final String token;
  final String label;
  final String? recipient;
  final List<String> folderIds;
  final bool hasPin;
  final DateTime expiresAt;
  final bool isActive;
  final int accessCount;

  bool get isExpired => DateTime.now().isAfter(expiresAt);
  bool get isValid => isActive && !isExpired;
  String shareUrl(String baseUrl) => '$baseUrl/portal/vault/$token';

  factory VaultShareLinkItem.fromJson(Map<String, dynamic> json) {
    return VaultShareLinkItem(
      id: (json['id'] ?? '').toString(),
      token: (json['token'] ?? '').toString(),
      label: (json['label'] ?? '').toString(),
      recipient: json['recipient']?.toString(),
      folderIds: ((json['folderIds'] as List?) ?? const [])
          .map((e) => e.toString())
          .toList(),
      hasPin: json['hasPin'] == true,
      expiresAt: DateTime.tryParse((json['expiresAt'] ?? '').toString()) ?? DateTime.now(),
      isActive: json['isActive'] != false,
      accessCount: (json['accessCount'] is num) ? (json['accessCount'] as num).toInt() : 0,
    );
  }
}

class VaultActivityItem {
  const VaultActivityItem({
    required this.id,
    required this.username,
    required this.action,
    required this.details,
    required this.createdAt,
  });

  final String id;
  final String username;
  final String action;
  final String details;
  final DateTime createdAt;

  factory VaultActivityItem.fromJson(Map<String, dynamic> json) {
    return VaultActivityItem(
      id: (json['id'] ?? '').toString(),
      username: (json['username'] ?? 'System').toString(),
      action: (json['action'] ?? '').toString(),
      details: (json['details'] ?? '').toString(),
      createdAt: DateTime.tryParse((json['createdAt'] ?? '').toString()) ?? DateTime.now(),
    );
  }
}

class VaultDataPayload {
  const VaultDataPayload({
    required this.canManage,
    required this.folders,
    required this.users,
    required this.shareLinks,
    required this.activityLogs,
  });

  final bool canManage;
  final List<VaultFolder> folders;
  final List<VaultUserAccount> users;
  final List<VaultShareLinkItem> shareLinks;
  final List<VaultActivityItem> activityLogs;

  factory VaultDataPayload.fromJson(Map<String, dynamic> json) {
    return VaultDataPayload(
      canManage: json['canManage'] == true,
      folders: ((json['folders'] as List?) ?? const [])
          .map((e) => VaultFolder.fromJson(e as Map<String, dynamic>))
          .toList(),
      users: ((json['users'] as List?) ?? const [])
          .map((e) => VaultUserAccount.fromJson(e as Map<String, dynamic>))
          .toList(),
      shareLinks: ((json['shareLinks'] as List?) ?? const [])
          .map((e) => VaultShareLinkItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      activityLogs: ((json['activityLogs'] as List?) ?? const [])
          .map((e) => VaultActivityItem.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}
