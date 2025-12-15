# CONTRIBUTING.md – Proyecto SIF (Sistema de Inventario y Facturación)

## Objetivo
Establecer un conjunto claro de buenas prácticas para:

-Facilitar el trabajo entre colaboradores

-Mantener un historial de cambios legible

-Garantizar calidad y orden en el código y documentación

### Requisitos para contribuir
Antes de comenzar a contribuir, asegúrate de:

-Tener instalado Git y tu editor de código preferido (VS Code recomendado)

-Leer el archivo README.md para entender la estructura del proyecto

-Usar un entorno de desarrollo apropiado (según lenguaje/framework)

-Estar en la última versión de la rama develop antes de hacer cambios

### Flujo de trabajo con Git

Ramas principales:

-main: Código en producción. Solo se actualiza desde release.

-develop: Rama activa de desarrollo general.

-feature/nombre: Nuevas funcionalidades.

-fix/nombre: Correcciones de errores.

-hotfix/nombre: Arreglos urgentes en producción.

-release/x.y.z: Preparación para una nueva versión.

### Ejemplo:

git checkout -b feature/agregar-clientes

 ## Convenciones de Commits (Conventional Commits)
Utilizamos la especificación Conventional Commits v1.0.0-beta.3 para todos los mensajes de confirmación (commit).

## Estructura
php-template
Copiar
Editar
<tipo>(<área>): <asunto>

<detalle opcional>

<footer opcional>
## Ejemplo:
makefile
Copiar
Editar
feat(inventario): agregar soporte para códigos de barras

Ahora se puede escanear y registrar productos mediante códigos de barras.

Closes #45


## Tipos de commit permitidos
 # Tipo	Uso
-feat	Agrega una nueva funcionalidad para el usuario final.

-fix	Corrige errores que afectan al usuario.

-docs	Modificaciones a la documentación.

-style	Cambios que no afectan la lógica (espacios, formato, etc.).

-refactor	Cambios en el código que no alteran funcionalidad ni corrigen errores.

-test	Adición o actualización de pruebas.

-chore	Cambios menores (scripts, dependencias, tareas).

-merge	Fusión de ramas.

-release	Publicación de una nueva versión del sistema.


## Alcance (<scope>) 
Representa el módulo o componente afectado. Puede dejarse vacío si el cambio afecta al sistema completo.

### Ejemplos válidos de scope:

-inventario

-ventas

-facturacion

-productos

-usuarios

-auth

-api

-db

-config

-frontend

### Cuerpo del mensaje 
Una descripción más amplia del cambio realizado. Debe explicar por qué se hizo el cambio (no necesariamente cómo).

 ### Footer 
Se usa para incluir metadatos útiles, como:

-Cierre de requerimientos o issues:

-less

Closes #3030, #1010
Mención de coautores:

-kotlin

Co-authored-by: Jose Andres <correo@sif.com>

-Cambios que rompen compatibilidad:

-bash

BREAKING CHANGE: Se eliminó el endpoint /api/v1/clientes.

### Versionamiento Semántico
### Motivos para su aplicación
-Sistema de versionado simple y estandarizado.
-Facilita el entendimiento para nuevos desarrolladores o consultores.
-Permite mantener el control del estado del proyecto.

SIF utiliza SemVer 2.0.0-rc.2:

-MAJOR.MINOR.PATCH
-MAJOR: Cambios incompatibles (rompen compatibilidad).
-MINOR: Nuevas funcionalidades compatibles.
-PATCH: Correcciones de errores o mejoras menores.

Ejemplo de versión:
SIF v2.1.4



