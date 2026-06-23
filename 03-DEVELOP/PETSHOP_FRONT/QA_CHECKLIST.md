# Checklist QA Manual - PETSHOP

**Objetivo:** validar end-to-end sin cambiar logica.

## Autenticacion y Roles
- Login con credenciales validas.
- Login con credenciales invalidas muestra error.
- Logout limpia sesion y redirige a `/`.
- Token expirado: poner un token vencido en `localStorage` y recargar, debe limpiar sesion.
- Cambio de rol: agregar el `id_usuario` en `localStorage.usersToLogout` y navegar, debe cerrar sesion.

## Dashboard
- Carga de estadisticas sin errores.
- Estado del sistema muestra backend y base de datos.
- Accesos rapidos navegan a las rutas correctas.

## Clientes
- Listado carga con paginacion.
- Busqueda filtra resultados.
- Crear cliente con datos validos.
- Validaciones bloquean envio con campos vacios.
- Editar cliente y verificar cambios en listado.

## Productos
- Listado carga con paginacion.
- Crear producto con imagen y sin imagen.
- Validaciones de SKU, precio, stock.
- Editar producto y verificar cambios en listado.

## Categorias
- Listado carga categorias.
- Crear categoria valida.
- Cambiar estado de categoria.
- Manejo de errores del backend.

## Recibos de Caja
- Carga inicial de clientes, categorias y productos.
- Numero de recibo se autoincrementa.
- Validaciones de formulario bloquean envio incompleto.
- Crear recibo exitoso actualiza stock.
- Manejo de respuesta sin datos en endpoints relacionados.

## Historial de Recibos
- Carga de historial.
- Filtros y rango de fechas si aplica.
- Estado vacio cuando no hay datos.

## Cierres de Caja
- Listado de cierres.
- Crear cierre con datos validos.
- Validaciones y errores de backend.

## Usuarios (Admin)
- Acceso solo con rol administrador.
- Listado de usuarios.
- Crear usuario con rol.
- Editar usuario y roles.

## Observabilidad
- Logs de warnings esperados sin duplicados.
- Errores reales muestran toast y logs con contexto.
