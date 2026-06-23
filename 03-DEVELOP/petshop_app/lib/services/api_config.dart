/// Configuracion de la API
class ApiConfig {
  // URL base de la API
  static const String baseUrl = 'http://127.0.0.1:3001/api/v1';

  // Endpoints
  static const String categories = '/categoria';
  static const String products = '/product';
  static const String receipts = '/recibo-caja';
  static const String auth = '/auth/login';
  static const String refresh = '';

  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Headers por defecto
  static Map<String, String> get headers => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Headers con autenticacion
  static Map<String, String> authHeaders(String token) => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer $token',
  };
}
