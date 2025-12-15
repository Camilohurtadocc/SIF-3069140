# Tareas Completadas para Almacenar Contraseña Hasheada en Tabla "usuarios"

## Paso 1: Usar Función RPC para Hashear Contraseña
- [x] Remover importación de bcryptjs (hasheo inseguro en cliente)
- [x] Actualizar handleSubmit en CrearUsuario.jsx para usar la función RPC 'insertar_usuario_contrasena'
- [x] La función RPC hashea la contraseña en el servidor usando pgcrypto y la almacena en la tabla "usuarios"

## Paso 2: Verificación
- [ ] Probar la creación de un nuevo usuario para confirmar que la contraseña se almacena hasheada en la tabla "usuarios"
- [ ] Verificar que el usuario puede iniciar sesión correctamente con Supabase Auth

## Notas
- La contraseña se hashea en el servidor usando PostgreSQL pgcrypto, lo cual es seguro.
- Supabase Auth maneja su propio hasheo para autenticación.
- La tabla "usuarios" ahora almacena la contraseña hasheada adicionalmente.
