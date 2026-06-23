import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/api_config.dart';

class AppProvider extends ChangeNotifier {
  User? _user;
  Timer? _sessionTimer;
  DateTime? _lastExpirySavedAt;
  bool _isForeground = true;

  static const String _userKey = 'auth_user';
  static const Duration _idleTimeout = Duration(minutes: 5);
  static const Duration _expiryUpdateThrottle = Duration(seconds: 30);

  // Servicios API
  final ApiService _apiService = ApiService();

  // Bandera para indicar si esta conectado a la API
  bool _isConnectedToApi = false;

  // Datos locales (se cargan desde la API cuando este disponible)
  final List<Category> _categories = [];
  final List<Product> _products = [];
  final List<Receipt> _receipts = [];

  // Getters
  User? get user => _user;
  List<Category> get categories => _categories;
  List<Product> get products => _products;
  List<Receipt> get receipts => _receipts;
  bool get isConnectedToApi => _isConnectedToApi;

  // ============ Metodos de API ============

  /// Inicializa la conexion con la API
  /// Llamar este metodo al iniciar la app
  Future<void> initApi() async {
    _apiService.sessionTtl = _idleTimeout;
    _apiService.onUnauthorized = () async {
      await logout();
    };

    await _apiService.restoreRefreshToken();
    _isConnectedToApi = await _apiService.restoreAuthToken();

    if (_isConnectedToApi) {
      await _restoreUser();
      _startSessionTimerFromExpiry();
    } else {
      await _clearStoredUser();
    }

    notifyListeners();
  }

  void recordActivity() {
    if (!_isForeground) return;
    if (!_isConnectedToApi || !_apiService.hasValidToken) return;

    _startSessionTimer(_idleTimeout);

    final now = DateTime.now();
    if (_lastExpirySavedAt == null ||
        now.difference(_lastExpirySavedAt!) >= _expiryUpdateThrottle) {
      _lastExpirySavedAt = now;
      _apiService.extendAuthExpiry(ttl: _idleTimeout);
    }
  }

  Future<void> handleAppLifecycle(AppLifecycleState state) async {
    if (state == AppLifecycleState.resumed) {
      _isForeground = true;
      final ok = await _apiService.restoreAuthToken();
      if (!ok) {
        await logout();
        return;
      }
      _isConnectedToApi = ok;
      _startSessionTimerFromExpiry();
    } else if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive ||
        state == AppLifecycleState.detached) {
      _isForeground = false;
    }
  }

  /// Sincroniza todos los datos con la API
  Future<void> syncWithApi() async {
    if (!_isConnectedToApi) return;

    await Future.wait([_fetchCategories(), _fetchProducts(), _fetchReceipts()]);
  }

  Future<void> refreshAll() async {
    if (!_isConnectedToApi) {
      _isConnectedToApi = await _apiService.restoreAuthToken();
      if (!_isConnectedToApi) return;
      await _restoreUser();
    }

    await syncWithApi();
  }

  Future<void> _fetchCategories() async {
    final response = await _apiService.get(ApiConfig.categories);
    if (response.success && response.data != null) {
      _categories.clear();
      _categories.addAll(_parseCategories(response.data));
      notifyListeners();
    }
  }

  Future<void> _fetchProducts() async {
    final response = await _apiService.get(ApiConfig.products);
    if (response.success && response.data != null) {
      _products.clear();
      _products.addAll(_parseProducts(response.data));
      notifyListeners();
    }
  }

  Future<void> _fetchReceipts() async {
    final response = await _apiService.get(ApiConfig.receipts);
    if (response.success && response.data != null) {
      _receipts.clear();
      _receipts.addAll(_parseReceipts(response.data));
      notifyListeners();
    }
  }

  // ============ Parsers ============

  List<Category> _parseCategories(dynamic data) {
    final items = _extractList(data);
    if (items.isEmpty) return [];
    final list = <Category>[];
    for (final item in items) {
      if (item is! Map) continue;
      list.add(
        Category(
          id: item['id']?.toString() ??
              item['id_categoria']?.toString() ??
              item['categoria_id']?.toString() ??
              '',
          name:
              (item['name'] ??
                      item['nombre'] ??
                      item['nombre_categoria'] ??
                      '')
                  .toString(),
          description:
              (item['description'] ??
                      item['descripcion'] ??
                      item['detalle'] ??
                      '')
                  .toString(),
          color:
              (item['color'] ??
                      item['color_hex'] ??
                      item['color_categoria'] ??
                      '#000000')
                  .toString(),
        ),
      );
    }
    return list;
  }

  List<Product> _parseProducts(dynamic data) {
    final items = _extractList(data);
    if (items.isEmpty) return [];
    final list = <Product>[];
    for (final item in items) {
      if (item is! Map) continue;

      String? categoryId =
          item['category_id']?.toString() ??
          item['categoryId']?.toString() ??
          item['id_categoria']?.toString() ??
          item['categoria_id']?.toString();

      final categoryObj = item['categoria'] ?? item['category'];
      if (categoryObj is Map) {
        categoryId ??=
            categoryObj['id']?.toString() ??
            categoryObj['id_categoria']?.toString();
        final categoryName = categoryObj['nombre'] ?? categoryObj['name'];
        if (categoryName != null && categoryName.toString().isNotEmpty) {
          categoryId = categoryName.toString();
        } else if (categoryId == null && categoryName != null) {
          categoryId = categoryName.toString();
        }
      } else {
        final categoryName =
            item['categoria'] ??
            item['category_name'] ??
            item['nombre_categoria'] ??
            item['category'];
        if (categoryName != null && categoryName.toString().isNotEmpty) {
          categoryId = categoryName.toString();
        } else if (categoryId == null && categoryName != null) {
          categoryId = categoryName.toString();
        }
      }

      list.add(
        Product(
          id:
              item['id']?.toString() ??
              item['id_producto']?.toString() ??
              item['producto_id']?.toString() ??
              '',
          name:
              (item['name'] ??
                      item['nombre'] ??
                      item['nombre_producto'] ??
                      '')
                  .toString(),
          description:
              (item['description'] ??
                      item['descripcion'] ??
                      item['detalle'] ??
                      item['descripcion_producto'] ??
                      '')
                  .toString(),
          price: _toDouble(
            item['price'] ??
                item['precio'] ??
                item['precio_unitario'] ??
                item['precio_venta'],
          ),
          stock: _toInt(
            item['stock'] ??
                item['existencias'] ??
                item['cantidad'] ??
                item['unidades'],
          ),
          categoryId: categoryId ?? '',
          imageUrl:
              item['image_url'] ??
              item['imageUrl'] ??
              item['imagen_url'] ??
              item['imagen'] ??
              item['url_imagen'],
        ),
      );
    }
    return list;
  }

  List<Receipt> _parseReceipts(dynamic data) {
    final items = _extractList(data);
    if (items.isEmpty) return [];
    final list = <Receipt>[];
    for (final item in items) {
      if (item is! Map) continue;
      final dateRaw = item['date'] ??
          item['fecha'] ??
          item['fecha_hora'] ??
          item['created_at'];
      final parsedDate = DateTime.tryParse(dateRaw?.toString() ?? '');

      final clienteRaw = item['cliente'];
      String? customerName;
      if (clienteRaw is Map) {
        customerName = _stringOrNull(
          clienteRaw['nombre'] ??
              clienteRaw['nombre_cliente'] ??
              clienteRaw['razon_social'] ??
              clienteRaw['name'],
        );
      } else {
        customerName = _stringOrNull(
          item['customer_name'] ??
              item['customerName'] ??
              item['cliente'] ??
              item['nombre_cliente'],
        );
      }

      list.add(
        Receipt(
          id:
              item['id']?.toString() ??
              item['id_recibo']?.toString() ??
              item['id_recibo_caja']?.toString() ??
              item['id_factura']?.toString() ??
              '',
          date: parsedDate ?? DateTime.now(),
          items: _parseReceiptItems(
            item['items'] ??
                item['detalle'] ??
                item['detalle_items'] ??
                item['detalle_recibo'] ??
                item['productos_recibo'] ??
                item['productosRecibo'] ??
                item['productos'],
          ),
          total: _toDouble(
            item['total'] ??
                item['monto_total'] ??
                item['total_pagar'] ??
                item['total_venta'] ??
                item['monto'] ??
                item['importe'],
          ),
          paymentMethod:
              (item['payment_method'] ??
                      item['paymentMethod'] ??
                      item['metodo_pago'] ??
                      item['forma_pago'] ??
                      item['tipo_pago'] ??
                      item['pago'] ??
                      '')
                  .toString(),
          customerName: customerName,
        ),
      );
    }
    return list;
  }

  List<ReceiptItem> _parseReceiptItems(dynamic items) {
    final list = _extractList(items);
    if (list.isEmpty) return [];
    final itemsParsed = <ReceiptItem>[];
    for (final item in list) {
      if (item is! Map) continue;
      final productObj = item['producto'] ?? item['product'];
      final productIdFromObj =
          productObj is Map
              ? (productObj['id']?.toString() ??
                  productObj['id_producto']?.toString())
              : null;
      final productNameFromObj =
          productObj is Map ? (productObj['nombre'] ?? productObj['name']) : null;

      final productId =
          item['product_id']?.toString() ??
          item['productId']?.toString() ??
          item['id_producto']?.toString() ??
          productIdFromObj ??
          '';
      final rawName =
          item['product_name'] ??
          item['productName'] ??
          item['nombre_producto'] ??
          item['nombre'] ??
          productNameFromObj ??
          '';
      final productName = rawName.toString().isNotEmpty
          ? rawName.toString()
          : (productId.isNotEmpty ? productId : 'Producto');

      itemsParsed.add(
        ReceiptItem(
          productId: productId,
          productName: productName,
          quantity: _toInt(
            item['quantity'] ?? item['cantidad'] ?? item['unidades'],
          ),
          price: _toDouble(
            item['price'] ??
                item['precio'] ??
                item['precio_unitario'] ??
                item['precio_venta'],
          ),
          subtotal: _toDouble(
            item['subtotal'] ??
                item['sub_total'] ??
                item['total_linea'] ??
                item['importe'],
          ),
        ),
      );
    }
    return itemsParsed;
  }

  List<dynamic> _extractList(dynamic data) {
    if (data is List) return data;
    if (data is String) {
      try {
        final decoded = jsonDecode(data);
        return _extractList(decoded);
      } catch (_) {
        return [];
      }
    }
    if (data is Map) {
      const keys = [
        'data',
        'items',
        'results',
        'rows',
        'categorias',
        'categoria',
        'productos',
        'productos_recibo',
        'productosRecibo',
        'product',
        'recibos',
        'recibo',
        'recibo_caja',
        'reciboCaja',
        'receipts',
      ];

      for (final key in keys) {
        final value = data[key];
        if (value is List) return value;
      }

      for (final key in keys) {
        final value = data[key];
        if (value is Map) {
          for (final nestedKey in keys) {
            final nested = value[nestedKey];
            if (nested is List) return nested;
          }
        }
      }
    }
    return [];
  }

  double _toDouble(dynamic value) {
    if (value == null) return 0;
    if (value is num) return value.toDouble();
    if (value is String) {
      final normalized = value.replaceAll(',', '.');
      return double.tryParse(normalized) ?? 0;
    }
    return 0;
  }

  int _toInt(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    if (value is num) return value.toInt();
    if (value is String) return int.tryParse(value) ?? 0;
    return 0;
  }

  String? _stringOrNull(dynamic value) {
    if (value == null) return null;
    if (value is String) return value;
    return value.toString();
  }

  // ============ Auth methods (simulado) ============
  bool login(String username, String password) {
    if (username == 'admin' && password == 'admin123') {
      _user = User(
        id: '1',
        username: 'admin',
        email: 'admin@petshop.com',
        role: 'Administrador',
      );
      notifyListeners();
      return true;
    }
    return false;
  }

  Future<void> logout() async {
    _user = null;
    _isConnectedToApi = false;
    _sessionTimer?.cancel();
    _sessionTimer = null;

    await _apiService.clearAuthToken();
    await _apiService.clearRefreshToken();
    await _clearStoredUser();

    notifyListeners();
  }

  /// Login con API
  Future<bool> loginWithApi(String username, String password) async {
    final identifier = username.trim();
    final candidates = <Map<String, dynamic>>[];

    void addBody(String userKey, String passKey) {
      candidates.add({userKey: identifier, passKey: password});
    }

    if (identifier.contains('@')) {
      addBody('correo_electronico', 'password');
      addBody('correo_electronico', 'contrasena');
      addBody('email', 'password');
      addBody('email', 'contrasena');
    } else {
      addBody('username', 'password');
      addBody('username', 'contrasena');
      addBody('usuario', 'password');
      addBody('usuario', 'contrasena');
    }

    ApiResponse response = ApiResponse.error('No se pudo autenticar');
    for (final body in candidates) {
      response = await _apiService.post(
        ApiConfig.auth,
        body: body,
      );

      if (response.success) break;
      if (response.statusCode != 400) break;
    }

    if (response.success && response.data != null) {
      final data = response.data;
      if (data is! Map) return false;

      final token = data['token'] ?? data['access_token'] ?? data['accessToken'];
      if (token != null) {
        await _apiService.saveAuthToken(token, ttl: _idleTimeout);

        final refreshToken = data['refresh_token'] ?? data['refreshToken'];
        if (refreshToken != null) {
          await _apiService.saveRefreshToken(refreshToken);
        }

        final user = data['user'];
        if (user is Map) {
          final roles = user['roles'];
          final roleFromArray = roles is List && roles.isNotEmpty
              ? roles.map((e) => e.toString()).join(', ')
              : null;

          _user = User(
            id: user['id']?.toString() ?? user['id_usuario']?.toString() ?? '',
            username:
                user['nombre'] ??
                user['username'] ??
                user['email'] ??
                user['correo_electronico'] ??
                '',
            email: user['email'] ?? user['correo_electronico'] ?? '',
            role: roleFromArray ?? user['role'] ?? '',
          );
        }

        if (_user != null) {
          await _persistUser(_user!);
          _isConnectedToApi = true;
          _startSessionTimer(_idleTimeout);

          await syncWithApi();

          notifyListeners();
          return true;
        }
      }
    }
    return false;
  }

  Future<void> _persistUser(User user) async {
    final prefs = await SharedPreferences.getInstance();
    final data = jsonEncode({
      'id': user.id,
      'username': user.username,
      'email': user.email,
      'role': user.role,
    });
    await prefs.setString(_userKey, data);
  }

  Future<bool> _restoreUser() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_userKey);
    if (raw == null) return false;

    final data = jsonDecode(raw);
    _user = User(
      id: data['id']?.toString() ?? '',
      username: data['username'] ?? '',
      email: data['email'] ?? '',
      role: data['role'] ?? '',
    );
    return true;
  }

  Future<void> _clearStoredUser() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_userKey);
  }

  void _startSessionTimer(Duration ttl) {
    _sessionTimer?.cancel();
    _sessionTimer = Timer(ttl, () {
      logout();
    });
  }

  void _startSessionTimerFromExpiry() {
    final expiry = _apiService.authExpiry;
    if (expiry == null) return;

    final remaining = expiry.difference(DateTime.now());
    if (remaining.isNegative) {
      logout();
      return;
    }

    _startSessionTimer(remaining);
  }

  // Category methods
  void addCategory(Category category) {
    _categories.add(category);
    notifyListeners();
  }

  void updateCategory(String id, Category category) {
    final index = _categories.indexWhere((c) => c.id == id);
    if (index != -1) {
      _categories[index] = category;
      notifyListeners();
    }
  }

  void deleteCategory(String id) {
    _categories.removeWhere((c) => c.id == id);
    notifyListeners();
  }

  // Product methods
  void addProduct(Product product) {
    _products.add(product);
    notifyListeners();
  }

  void updateProduct(String id, Product product) {
    final index = _products.indexWhere((p) => p.id == id);
    if (index != -1) {
      _products[index] = product;
      notifyListeners();
    }
  }

  void deleteProduct(String id) {
    _products.removeWhere((p) => p.id == id);
    notifyListeners();
  }

  // Receipt methods
  void addReceipt(Receipt receipt) {
    _receipts.insert(0, receipt);

    // Update stock
    for (var item in receipt.items) {
      final productIndex = _products.indexWhere((p) => p.id == item.productId);
      if (productIndex != -1) {
        final product = _products[productIndex];
        _products[productIndex] = Product(
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock - item.quantity,
          categoryId: product.categoryId,
          imageUrl: product.imageUrl,
        );
      }
    }
    notifyListeners();
  }
}
