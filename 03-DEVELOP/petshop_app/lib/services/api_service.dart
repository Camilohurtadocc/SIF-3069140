import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'api_config.dart';

/// Clase base para hacer peticiones HTTP a la API
class ApiService {
  String? _authToken;
  DateTime? _authExpiry;
  String? _refreshToken;

  static const String _tokenKey = 'auth_token';
  static const String _tokenExpiryKey = 'auth_token_expiry';
  static const String _refreshTokenKey = 'refresh_token';

  Duration sessionTtl = const Duration(minutes: 5);
  Future<void> Function()? onUnauthorized;

  // Singleton pattern
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  /// Establece el token de autenticacion en memoria
  void setAuthToken(String token, {DateTime? expiry}) {
    _authToken = token;
    _authExpiry = expiry;
  }

  /// Persiste el token con expiracion (TTL)
  Future<void> saveAuthToken(String token, {Duration? ttl}) async {
    final expiry = DateTime.now().add(ttl ?? sessionTtl);
    _authToken = token;
    _authExpiry = expiry;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setInt(_tokenExpiryKey, expiry.millisecondsSinceEpoch);
  }

  /// Actualiza solo la expiracion (actividad en app)
  Future<void> extendAuthExpiry({Duration? ttl}) async {
    if (_authToken == null) return;

    final expiry = DateTime.now().add(ttl ?? sessionTtl);
    _authExpiry = expiry;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_tokenExpiryKey, expiry.millisecondsSinceEpoch);
  }

  /// Restaura el token si no ha expirado
  Future<bool> restoreAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    final expiryMs = prefs.getInt(_tokenExpiryKey);

    if (token == null || expiryMs == null) {
      await clearAuthToken();
      return false;
    }

    final expiry = DateTime.fromMillisecondsSinceEpoch(expiryMs);
    if (DateTime.now().isAfter(expiry)) {
      await clearAuthToken();
      return false;
    }

    _authToken = token;
    _authExpiry = expiry;
    return true;
  }

  Future<void> saveRefreshToken(String token) async {
    _refreshToken = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_refreshTokenKey, token);
  }

  Future<bool> restoreRefreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_refreshTokenKey);
    if (token == null) return false;
    _refreshToken = token;
    return true;
  }

  Future<void> clearRefreshToken() async {
    _refreshToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_refreshTokenKey);
  }

  /// Limpia el token de autenticacion (logout)
  Future<void> clearAuthToken({bool clearStorage = true}) async {
    _authToken = null;
    _authExpiry = null;

    if (clearStorage) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_tokenKey);
      await prefs.remove(_tokenExpiryKey);
    }
  }

  bool get hasValidToken {
    if (_authToken == null) return false;
    if (_authExpiry == null) return true;
    return DateTime.now().isBefore(_authExpiry!);
  }

  DateTime? get authExpiry => _authExpiry;

  /// Obtiene los headers con o sin autenticacion
  Map<String, String> get _headers {
    if (hasValidToken && _authToken != null) {
      return ApiConfig.authHeaders(_authToken!);
    }
    return ApiConfig.headers;
  }

  /// GET request
  Future<ApiResponse> get(String endpoint) async {
    return _request('GET', endpoint);
  }

  /// POST request
  Future<ApiResponse> post(
    String endpoint, {
    Map<String, dynamic>? body,
  }) async {
    return _request('POST', endpoint, body: body);
  }

  /// PUT request
  Future<ApiResponse> put(String endpoint, {Map<String, dynamic>? body}) async {
    return _request('PUT', endpoint, body: body);
  }

  /// DELETE request
  Future<ApiResponse> delete(String endpoint) async {
    return _request('DELETE', endpoint);
  }

  Future<ApiResponse> _request(
    String method,
    String endpoint, {
    Map<String, dynamic>? body,
    bool allowRefresh = true,
  }) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}$endpoint');
      http.Response response;

      switch (method) {
        case 'POST':
          response = await http
              .post(
                uri,
                headers: _headers,
                body: body != null ? jsonEncode(body) : null,
              )
              .timeout(ApiConfig.connectTimeout);
          break;
        case 'PUT':
          response = await http
              .put(
                uri,
                headers: _headers,
                body: body != null ? jsonEncode(body) : null,
              )
              .timeout(ApiConfig.connectTimeout);
          break;
        case 'DELETE':
          response = await http
              .delete(uri, headers: _headers)
              .timeout(ApiConfig.connectTimeout);
          break;
        default:
          response = await http
              .get(uri, headers: _headers)
              .timeout(ApiConfig.connectTimeout);
          break;
      }

      if (response.statusCode == 401 && allowRefresh) {
        final refreshed = await _refreshAccessToken();
        if (refreshed) {
          return _request(
            method,
            endpoint,
            body: body,
            allowRefresh: false,
          );
        }

        if (onUnauthorized != null) {
          await onUnauthorized!();
        }
      }

      return _handleResponse(response);
    } catch (e) {
      return ApiResponse.error('Error de conexion: $e');
    }
  }

  Future<bool> _refreshAccessToken() async {
    if (ApiConfig.refresh.isEmpty) return false;
    if (_refreshToken == null) return false;

    try {
      final response = await http
          .post(
            Uri.parse('${ApiConfig.baseUrl}${ApiConfig.refresh}'),
            headers: ApiConfig.headers,
            body: jsonEncode({'refresh_token': _refreshToken}),
          )
          .timeout(ApiConfig.connectTimeout);

      if (response.statusCode < 200 || response.statusCode >= 300) {
        return false;
      }

      final body = response.body.isNotEmpty ? jsonDecode(response.body) : null;
      if (body == null) return false;

      final newToken =
          body['token'] ?? body['access_token'] ?? body['accessToken'];
      if (newToken == null) return false;

      await saveAuthToken(newToken);

      final newRefresh =
          body['refresh_token'] ?? body['refreshToken'] ?? _refreshToken;
      if (newRefresh != null) {
        await saveRefreshToken(newRefresh);
      }

      return true;
    } catch (_) {
      return false;
    }
  }

  /// Maneja la respuesta de la API
  ApiResponse _handleResponse(http.Response response) {
    final body = response.body.isNotEmpty ? jsonDecode(response.body) : null;

    if (response.statusCode < 200 || response.statusCode >= 300) {
      assert(() {
        final method = response.request?.method ?? 'HTTP';
        final url = response.request?.url.toString() ?? '';
        debugPrint('API $method $url -> ${response.statusCode}');
        if (response.body.isNotEmpty) {
          debugPrint('API error body: ${response.body}');
        }
        return true;
      }());
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return ApiResponse.success(body);
    } else if (response.statusCode == 401) {
      return ApiResponse.error('No autorizado', statusCode: 401);
    } else if (response.statusCode == 404) {
      return ApiResponse.error('Recurso no encontrado', statusCode: 404);
    } else if (response.statusCode >= 500) {
      return ApiResponse.error(
        'Error del servidor',
        statusCode: response.statusCode,
      );
    } else {
      final message = body?['message'] ?? 'Error desconocido';
      return ApiResponse.error(message, statusCode: response.statusCode);
    }
  }
}

/// Respuesta de la API
class ApiResponse {
  final bool success;
  final dynamic data;
  final String? message;
  final int? statusCode;

  ApiResponse._({
    required this.success,
    this.data,
    this.message,
    this.statusCode,
  });

  factory ApiResponse.success(dynamic data) {
    return ApiResponse._(success: true, data: data);
  }

  factory ApiResponse.error(String message, {int? statusCode}) {
    return ApiResponse._(
      success: false,
      message: message,
      statusCode: statusCode,
    );
  }
}
