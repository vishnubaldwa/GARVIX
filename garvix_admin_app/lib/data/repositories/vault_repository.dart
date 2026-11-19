import 'dart:io';

import '../../domain/models/vault_models.dart';
import '../services/api_client.dart';

class VaultRepository {
  VaultRepository({required this._apiClient});

  final ApiClient _apiClient;

  Future<String> getBaseUrl() => _apiClient.getBaseUrl();

  Future<VaultDataPayload> fetchVault() async {
    final data = await _apiClient.get('/api/admin/vault/folders');
    return VaultDataPayload.fromJson(data);
  }

  Future<void> createFolder({
    required String name,
    String? description,
  }) async {
    await _apiClient.post(
      '/api/admin/vault/folders',
      body: {
        'name': name.trim(),
        if (description != null && description.trim().isNotEmpty)
          'description': description.trim(),
      },
    );
  }

  Future<void> renameFolder({
    required String folderId,
    required String name,
    String? description,
  }) async {
    await _apiClient.patch(
      '/api/admin/vault/folders/$folderId',
      body: {
        'name': name.trim(),
        if (description != null) 'description': description.trim(),
      },
    );
  }

  Future<void> deleteFolder(String folderId) async {
    await _apiClient.delete('/api/admin/vault/folders/$folderId');
  }

  Future<void> uploadDocuments({
    required String folderId,
    required List<File> files,
    String? title,
    String? notes,
  }) async {
    await _apiClient.uploadMultipartFiles(
      '/api/admin/vault/documents',
      fields: {
        'folderId': folderId,
        if (title != null && title.trim().isNotEmpty) 'title': title.trim(),
        if (notes != null && notes.trim().isNotEmpty) 'notes': notes.trim(),
      },
      files: files,
    );
  }

  Future<void> deleteDocument(String documentId) async {
    await _apiClient.delete('/api/admin/vault/documents/$documentId');
  }

  Future<File> downloadDocument(VaultDocument doc) {
    return _apiClient.downloadBinaryFile(
      '/api/admin/vault/documents/${doc.id}/file?mode=download',
      suggestedFileName: doc.originalName,
    );
  }

  Future<List<int>> fetchDocumentPreviewBytes(VaultDocument doc) {
    return _apiClient.fetchBinaryBytes(
      '/api/admin/vault/documents/${doc.id}/file?mode=inline',
    );
  }

  Future<File> downloadZip({String? folderId, String? folderName}) {
    final path = folderId == null
        ? '/api/admin/vault/zip'
        : '/api/admin/vault/zip?folderId=$folderId';
    final fileName = folderName != null
        ? 'GARVIX_$folderName.zip'
        : 'GARVIX_Company_Vault_Kit.zip';
    return _apiClient.downloadBinaryFile(path, suggestedFileName: fileName);
  }

  Future<Map<String, dynamic>> createVaultUser({
    required String name,
    required String username,
    required String password,
    required String role,
    int? expiresInDays,
    required List<String> folderIds,
  }) {
    return _apiClient.post(
      '/api/admin/vault/access',
      body: {
        'name': name.trim(),
        'username': username.trim(),
        'password': password,
        'role': role,
        'expiresInDays': expiresInDays,
        'folderIds': folderIds,
      },
    );
  }

  Future<void> updateUserAccess({
    required String userId,
    List<String>? folderIds,
    bool? isActive,
  }) async {
    await _apiClient.patch(
      '/api/admin/vault/access',
      body: {
        'userId': userId,
        'folderIds': ?folderIds,
        'isActive': ?isActive,
      },
    );
  }

  Future<void> createShareLink({
    required String label,
    String? recipient,
    String? pin,
    required int expiresInHours,
    required List<String> folderIds,
  }) async {
    await _apiClient.post(
      '/api/admin/vault/shares',
      body: {
        'label': label.trim(),
        if (recipient != null && recipient.trim().isNotEmpty)
          'recipient': recipient.trim(),
        if (pin != null && pin.trim().isNotEmpty) 'pin': pin.trim(),
        'expiresInHours': expiresInHours,
        'folderIds': folderIds,
      },
    );
  }

  Future<void> revokeShareLink(String shareId) async {
    await _apiClient.delete('/api/admin/vault/shares/$shareId');
  }
}
