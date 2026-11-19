import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';

import 'token_storage.dart';

class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({
    required this._tokenStorage,
    http.Client? httpClient,
  })  : _client = httpClient ?? http.Client();

  final TokenStorage _tokenStorage;
  final http.Client _client;

  Future<String> getBaseUrl() => _tokenStorage.readBaseUrl();

  Future<Map<String, String>> _buildHeaders({bool jsonContent = true}) async {
    final token = await _tokenStorage.readToken();
    return {
      if (jsonContent) HttpHeaders.contentTypeHeader: 'application/json; charset=UTF-8',
      HttpHeaders.acceptHeader: 'application/json',
      if (token != null && token.isNotEmpty)
        HttpHeaders.authorizationHeader: 'Bearer $token',
    };
  }

  Map<String, dynamic> _decodeResponse(http.Response response) {
    Map<String, dynamic> data = {};
    if (response.body.isNotEmpty) {
      try {
        final decoded = jsonDecode(response.body);
        if (decoded is Map<String, dynamic>) {
          data = decoded;
        }
      } catch (_) {
        // Non-JSON response body
      }
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    }

    final errorMessage = (data['error'] ??
            data['message'] ??
            'Request failed (HTTP ${response.statusCode})')
        .toString();
    throw ApiException(errorMessage, statusCode: response.statusCode);
  }

  Future<Map<String, dynamic>> get(String path) async {
    final baseUrl = await getBaseUrl();
    final response = await _client.get(
      Uri.parse('$baseUrl$path'),
      headers: await _buildHeaders(),
    );
    return _decodeResponse(response);
  }

  Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final baseUrl = await getBaseUrl();
    final response = await _client.post(
      Uri.parse('$baseUrl$path'),
      headers: await _buildHeaders(),
      body: jsonEncode(body ?? const {}),
    );
    return _decodeResponse(response);
  }

  Future<Map<String, dynamic>> patch(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final baseUrl = await getBaseUrl();
    final response = await _client.patch(
      Uri.parse('$baseUrl$path'),
      headers: await _buildHeaders(),
      body: jsonEncode(body ?? const {}),
    );
    return _decodeResponse(response);
  }

  Future<Map<String, dynamic>> delete(String path) async {
    final baseUrl = await getBaseUrl();
    final response = await _client.delete(
      Uri.parse('$baseUrl$path'),
      headers: await _buildHeaders(),
    );
    return _decodeResponse(response);
  }

  Future<Map<String, dynamic>> uploadMultipartFiles(
    String path, {
    required Map<String, String> fields,
    required List<File> files,
    String fileFieldName = 'files',
  }) async {
    final baseUrl = await getBaseUrl();
    final token = await _tokenStorage.readToken();
    final request = http.MultipartRequest('POST', Uri.parse('$baseUrl$path'));

    if (token != null && token.isNotEmpty) {
      request.headers[HttpHeaders.authorizationHeader] = 'Bearer $token';
    }
    request.fields.addAll(fields);

    for (final file in files) {
      request.files.add(
        await http.MultipartFile.fromPath(fileFieldName, file.path),
      );
    }

    final streamed = await _client.send(request);
    final response = await http.Response.fromStream(streamed);
    return _decodeResponse(response);
  }

  Future<File> downloadBinaryFile(
    String path, {
    required String suggestedFileName,
  }) async {
    final baseUrl = await getBaseUrl();
    final response = await _client.get(
      Uri.parse('$baseUrl$path'),
      headers: await _buildHeaders(jsonContent: false),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      String msg = 'Download failed (HTTP ${response.statusCode})';
      try {
        final decoded = jsonDecode(response.body);
        if (decoded is Map && decoded['error'] != null) {
          msg = decoded['error'].toString();
        }
      } catch (_) {}
      throw ApiException(msg, statusCode: response.statusCode);
    }

    final tempDir = await getTemporaryDirectory();
    final safeName =
        suggestedFileName.replaceAll(RegExp(r'[^a-zA-Z0-9._\-()]'), '_');
    final file = File('${tempDir.path}/$safeName');
    await file.writeAsBytes(response.bodyBytes, flush: true);
    return file;
  }

  Future<List<int>> fetchBinaryBytes(String path) async {
    final baseUrl = await getBaseUrl();
    final response = await _client.get(
      Uri.parse('$baseUrl$path'),
      headers: await _buildHeaders(jsonContent: false),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(
        'Failed to load preview (HTTP ${response.statusCode})',
        statusCode: response.statusCode,
      );
    }
    return response.bodyBytes;
  }
}
