-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 05-05-2026 a las 22:08:20
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `my_database_petshop`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL,
  `nombre_categoria` varchar(150) NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id_categoria`, `nombre_categoria`, `estado`) VALUES
(1, 'Alimentos para perros', 'activo'),
(2, 'Alimentos para gatos', 'activo'),
(3, 'Accesorios para paseo', 'activo'),
(4, 'Cuidado e higiene', 'activo'),
(5, 'Juguetes para perros', 'activo'),
(6, 'Juguetes para gatos', 'activo'),
(7, 'Medicamentos veterinarios', 'activo'),
(8, 'Snacks y premios', 'activo'),
(9, 'Ropa y accesorios de moda', 'inactivo'),
(10, 'Camas y descanso', 'activo'),
(11, 'Transporte y viajes', 'activo'),
(12, 'Entrenamiento y obediencia', 'inactivo'),
(13, 'Peces y acuarios', 'activo'),
(14, 'Aves y jaulas', 'activo'),
(15, 'Roedores y pequeños mamíferos', 'activo'),
(16, 'Reptiles y terrarios', 'activo'),
(17, 'Accesorios de limpieza', 'activo'),
(18, 'Cosmética y cuidado estético', 'inactivo'),
(19, 'Suplementos alimenticios', 'activo'),
(20, 'Otros productos para mascotas', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cierres_caja`
--

CREATE TABLE `cierres_caja` (
  `id_cierre_caja` int(11) NOT NULL,
  `tipo_periodo` enum('diario','semanal','quincenal','mensual','anual') NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `total_ventas` decimal(12,2) NOT NULL DEFAULT 0.00,
  `cantidad_recibos` int(11) NOT NULL DEFAULT 0,
  `id_usuario` varchar(255) NOT NULL,
  `fecha_cierre` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cierres_caja`
--

INSERT INTO `cierres_caja` (`id_cierre_caja`, `tipo_periodo`, `fecha_inicio`, `fecha_fin`, `total_ventas`, `cantidad_recibos`, `id_usuario`, `fecha_cierre`) VALUES
(1, 'diario', '2026-05-05', '2026-05-05', 179920.00, 1, 'admin_1774478686065', '2026-05-05 19:34:04');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id_cliente` int(11) NOT NULL,
  `numero_documento` varchar(20) NOT NULL,
  `correo_electronico` varchar(150) DEFAULT NULL,
  `primer_nombre` varchar(100) NOT NULL,
  `segundo_nombre` varchar(100) DEFAULT NULL,
  `primer_apellido` varchar(100) NOT NULL,
  `segundo_apellido` varchar(100) DEFAULT NULL,
  `numero_telefono` varchar(20) DEFAULT NULL,
  `id_usuario` varchar(255) DEFAULT NULL,
  `id_tipo_documento` int(11) NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  `fecha_actualizacion` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id_cliente`, `numero_documento`, `correo_electronico`, `primer_nombre`, `segundo_nombre`, `primer_apellido`, `segundo_apellido`, `numero_telefono`, `id_usuario`, `id_tipo_documento`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, '1078855621', 'juan@gmail.com', 'juan', 'mario', 'perez', 'marzial', '3152488563', NULL, 1, '2026-05-05 19:32:26', '2026-05-05 19:32:26');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL,
  `codigo_sku` varchar(30) NOT NULL,
  `nombre_producto` varchar(150) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `precio_unitario` decimal(10,2) NOT NULL,
  `presentacion_producto` varchar(100) DEFAULT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `id_categoria` int(11) DEFAULT NULL,
  `url_imagen` varchar(255) DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL,
  `fecha_actualizacion` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `codigo_sku`, `nombre_producto`, `stock`, `precio_unitario`, `presentacion_producto`, `estado`, `id_categoria`, `url_imagen`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'SKU-C001', 'Croquetas para perros adulto 5kg', 49, 143960.00, 'Bolsa 5 kg', 'activo', 1, NULL, '2026-03-25 22:43:26', '2026-03-25 22:43:26'),
(2, 'SKU-C002', 'Alimento húmedo para gatos 400g', 100, 50000.00, 'Lata 400 g', 'activo', 2, NULL, '2026-03-25 22:43:26', '2026-03-25 22:43:26'),
(3, 'SKU-C003', 'Snack dental para perros 150g', 74, 35960.00, 'Paquete 150 g', 'activo', 1, NULL, '2026-03-25 22:43:26', '2026-03-25 22:43:26'),
(4, 'SKU-A001', 'Collar ajustable para perros', 40, 60000.00, 'Unidad', 'activo', 3, NULL, '2026-03-25 22:43:26', '2026-03-25 22:43:26'),
(5, 'SKU-A002', 'Juguete de cuerda para mascotas', 60, 38000.00, 'Unidad', 'activo', 5, NULL, '2026-03-25 22:43:26', '2026-03-25 22:43:26'),
(6, 'SKU-A003', 'Cama ortopédica para perros medianos', 20, 480000.00, 'Unidad', 'activo', 10, NULL, '2026-03-25 22:43:26', '2026-03-25 22:43:26'),
(7, 'SKU-L001', 'Champú antipulgas para perros 500ml', 80, 72000.00, 'Botella 500 ml', 'activo', 4, NULL, '2026-03-25 22:43:26', '2026-03-25 22:43:26'),
(8, 'SKU-L002', 'Arena para gatos perfumada 10kg', 30, 102000.00, 'Bolsa 10 kg', 'activo', 2, NULL, '2026-03-25 22:43:26', '2026-03-25 22:43:26'),
(9, 'SKU-L003', 'Toallitas húmedas para mascotas 100 uds', 100, 31960.00, 'Paquete 100 uds', 'activo', 17, NULL, '2026-03-25 22:43:26', '2026-03-25 22:43:26'),
(10, 'SKU-C004', 'Comida para peces perros 200g', 60, 23960.00, 'Paquete 200 g', 'activo', 1, NULL, '2026-03-25 22:43:26', '2026-03-25 22:43:26'),
(11, 'SKU-A004', 'Transportadora para gatos pequeña', 15, 180000.00, 'Unidad', 'activo', 11, NULL, '2026-03-25 22:43:26', '2026-03-25 22:43:26'),
(12, 'SKU-C005', 'Comida para gatos 1kg', 40, 56000.00, 'Bolsa 1 kg', 'activo', 2, NULL, '2026-03-25 22:43:26', '2026-03-25 22:43:26'),
(13, 'SKU-L004', 'Desodorante para mascotas spray 250ml', 50, 48000.00, 'Spray 250 ml', 'activo', 4, NULL, '2026-03-25 22:43:26', '2026-03-25 22:43:26'),
(14, 'SKU-A005', 'Rascador para gatos mediano', 25, 140000.00, 'Unidad', 'activo', 6, NULL, '2026-03-25 22:43:26', '2026-03-25 22:43:26'),
(15, 'SKU-C006', 'Leche para cachorros 1L', 30, 80000.00, 'Botella 1 L', 'activo', 1, NULL, '2026-03-25 22:43:26', '2026-03-25 22:43:26'),
(16, 'SKU-L005', 'Cepillo para eliminación de pelo', 70, 42000.00, 'Unidad', 'activo', 4, NULL, '2026-03-25 22:43:26', '2026-03-25 22:43:26'),
(17, 'SKU-A006', 'Correa retráctil para perros 5m', 45, 88000.00, 'Unidad', 'activo', 3, NULL, '2026-03-25 22:43:26', '2026-03-25 22:43:26'),
(18, 'SKU-C007', 'Alimento balanceado para gatos 500g', 55, 36000.00, 'Bolsa 500 g', 'activo', 2, NULL, '2026-03-25 22:43:26', '2026-03-25 22:43:26'),
(19, 'SKU-L006', 'Limpiador de oídos para mascotas 100ml', 35, 56000.00, 'Botella 100 ml', 'activo', 4, NULL, '2026-03-25 22:43:26', '2026-03-25 22:43:26'),
(20, 'SKU-A007', 'Comedero automático para perros 3L', 10, 240000.00, 'Unidad', 'activo', 3, NULL, '2026-03-25 22:43:26', '2026-03-25 22:43:26');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos_recibo`
--

CREATE TABLE `productos_recibo` (
  `id_producto_recibo` int(11) NOT NULL,
  `id_recibo_caja` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_venta` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos_recibo`
--

INSERT INTO `productos_recibo` (`id_producto_recibo`, `id_recibo_caja`, `id_producto`, `cantidad`, `precio_venta`) VALUES
(1, 1, 1, 1, 143960.00),
(2, 1, 3, 1, 35960.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recibo_caja`
--

CREATE TABLE `recibo_caja` (
  `id_recibo_caja` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `fecha_recibo_caja` datetime NOT NULL,
  `numero_recibo_caja` int(11) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `tipo_pago` enum('efectivo','tarjeta_credito','tarjeta_debito','otro') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `recibo_caja`
--

INSERT INTO `recibo_caja` (`id_recibo_caja`, `id_cliente`, `fecha_recibo_caja`, `numero_recibo_caja`, `total`, `tipo_pago`) VALUES
(1, 1, '2026-05-05 19:33:26', 1, 179920.00, 'efectivo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id_rol` int(11) NOT NULL,
  `nombre_rol` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id_rol`, `nombre_rol`) VALUES
(1, 'Administrador'),
(2, 'Vendedor');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_documento`
--

CREATE TABLE `tipo_documento` (
  `id_tipo_documento` int(11) NOT NULL,
  `abreviatura` varchar(10) NOT NULL,
  `nombre_documento` varchar(150) NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_documento`
--

INSERT INTO `tipo_documento` (`id_tipo_documento`, `abreviatura`, `nombre_documento`, `estado`) VALUES
(1, 'CC', 'Cédula de Ciudadanía', 'activo'),
(2, 'CE', 'Cédula de Extranjería', 'activo'),
(3, 'PP', 'Pasaporte', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` varchar(255) NOT NULL,
  `contraseña` varchar(60) DEFAULT NULL,
  `correo_electronico` varchar(150) NOT NULL,
  `activado` tinyint(1) NOT NULL DEFAULT 1,
  `idioma` char(2) NOT NULL DEFAULT 'es',
  `url_imagen` varchar(255) DEFAULT NULL,
  `clave_activacion` varchar(50) DEFAULT NULL,
  `clave_restablecimiento` varchar(50) DEFAULT NULL,
  `fecha_restablecimiento` datetime DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL,
  `fecha_actualizacion` datetime NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `contraseña`, `correo_electronico`, `activado`, `idioma`, `url_imagen`, `clave_activacion`, `clave_restablecimiento`, `fecha_restablecimiento`, `fecha_creacion`, `fecha_actualizacion`, `estado`) VALUES
('admin_1774478686065', '$2b$10$SUzaoWdMbvI6fp3b9Lj.SeNl3Efyjr0hGdnQ0jcfd5eKLK6xBzBcO', 'admin@vetshop.com', 1, 'es', NULL, NULL, NULL, NULL, '2026-03-25 22:44:46', '2026-03-25 22:44:46', 'activo'),
('user_1778010032653_eur2tzqwr', '$2b$10$nH7MAM.041PGdMqvpwMX8uBfmtv6yLb9dC1vm9XThWAlqMMfc4Fdi', 'juan@gmail.com', 1, 'Es', NULL, NULL, NULL, NULL, '2026-05-05 19:40:32', '2026-05-05 19:40:32', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_rol`
--

CREATE TABLE `usuario_rol` (
  `id_usuario` varchar(255) NOT NULL,
  `id_rol` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario_rol`
--

INSERT INTO `usuario_rol` (`id_usuario`, `id_rol`) VALUES
('admin_1774478686065', 1),
('user_1778010032653_eur2tzqwr', 2);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`),
  ADD UNIQUE KEY `nombre_categoria` (`nombre_categoria`);

--
-- Indices de la tabla `cierres_caja`
--
ALTER TABLE `cierres_caja`
  ADD PRIMARY KEY (`id_cierre_caja`),
  ADD UNIQUE KEY `cierres_caja_tipo_periodo_fecha_inicio_fecha_fin_id_usuario` (`tipo_periodo`,`fecha_inicio`,`fecha_fin`,`id_usuario`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `numero_documento` (`numero_documento`),
  ADD UNIQUE KEY `correo_electronico` (`correo_electronico`),
  ADD UNIQUE KEY `numero_telefono` (`numero_telefono`),
  ADD UNIQUE KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_tipo_documento` (`id_tipo_documento`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id_producto`),
  ADD UNIQUE KEY `codigo_sku` (`codigo_sku`),
  ADD KEY `id_categoria` (`id_categoria`);

--
-- Indices de la tabla `productos_recibo`
--
ALTER TABLE `productos_recibo`
  ADD PRIMARY KEY (`id_producto_recibo`),
  ADD UNIQUE KEY `productos_recibo_id_recibo_caja_id_producto` (`id_recibo_caja`,`id_producto`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `recibo_caja`
--
ALTER TABLE `recibo_caja`
  ADD PRIMARY KEY (`id_recibo_caja`),
  ADD UNIQUE KEY `numero_recibo_caja` (`numero_recibo_caja`),
  ADD KEY `id_cliente` (`id_cliente`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`),
  ADD UNIQUE KEY `nombre_rol` (`nombre_rol`);

--
-- Indices de la tabla `tipo_documento`
--
ALTER TABLE `tipo_documento`
  ADD PRIMARY KEY (`id_tipo_documento`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `correo_electronico` (`correo_electronico`);

--
-- Indices de la tabla `usuario_rol`
--
ALTER TABLE `usuario_rol`
  ADD PRIMARY KEY (`id_usuario`,`id_rol`),
  ADD KEY `id_rol` (`id_rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `cierres_caja`
--
ALTER TABLE `cierres_caja`
  MODIFY `id_cierre_caja` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `productos_recibo`
--
ALTER TABLE `productos_recibo`
  MODIFY `id_producto_recibo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `recibo_caja`
--
ALTER TABLE `recibo_caja`
  MODIFY `id_recibo_caja` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `tipo_documento`
--
ALTER TABLE `tipo_documento`
  MODIFY `id_tipo_documento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cierres_caja`
--
ALTER TABLE `cierres_caja`
  ADD CONSTRAINT `cierres_caja_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `clientes_ibfk_2` FOREIGN KEY (`id_tipo_documento`) REFERENCES `tipo_documento` (`id_tipo_documento`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `productos_recibo`
--
ALTER TABLE `productos_recibo`
  ADD CONSTRAINT `productos_recibo_ibfk_1` FOREIGN KEY (`id_recibo_caja`) REFERENCES `recibo_caja` (`id_recibo_caja`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `productos_recibo_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `recibo_caja`
--
ALTER TABLE `recibo_caja`
  ADD CONSTRAINT `recibo_caja_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuario_rol`
--
ALTER TABLE `usuario_rol`
  ADD CONSTRAINT `usuario_rol_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `usuario_rol_ibfk_2` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE NO ACTION ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
