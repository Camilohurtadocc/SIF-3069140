class User {
  final String id;
  final String username;
  final String email;
  final String role;

  User({
    required this.id,
    required this.username,
    required this.email,
    required this.role,
  });
}

class Category {
  final String id;
  final String name;
  final String description;
  final String color;

  Category({
    required this.id,
    required this.name,
    required this.description,
    required this.color,
  });
}

class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final int stock;
  final String categoryId;
  final String? imageUrl;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.stock,
    required this.categoryId,
    this.imageUrl,
  });
}

class ReceiptItem {
  final String productId;
  final String productName;
  final int quantity;
  final double price;
  final double subtotal;

  ReceiptItem({
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.price,
    required this.subtotal,
  });
}

class Receipt {
  final String id;
  final DateTime date;
  final List<ReceiptItem> items;
  final double total;
  final String paymentMethod;
  final String? customerName;

  Receipt({
    required this.id,
    required this.date,
    required this.items,
    required this.total,
    required this.paymentMethod,
    this.customerName,
  });
}
