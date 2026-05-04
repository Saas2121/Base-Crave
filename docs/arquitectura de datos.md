🗄️ Modelo de Base de Datos
Quiero que uses el siguiente modelo relacional como base para el backend de la aplicación. Este modelo define las entidades principales y sus relaciones.
👤 Tabla: Users
Representa a todos los usuarios del sistema (clientes y administradores de tienda).
Campos:
id: UUID (PK, NOT NULL)
name: TEXT (NOT NULL)
email: TEXT (NOT NULL, UNIQUE)
role: TEXT (NOT NULL) → valores posibles: consumer, store_admin
createdAt: TIMESTAMP (NOT NULL)
🏪 Tabla: Stores
Representa las tiendas o negocios.
Campos:
id: UUID (PK, NOT NULL)
name: TEXT (NOT NULL)
description: TEXT
address: TEXT (NOT NULL)
latitude: DECIMAL (NOT NULL)
longitude: DECIMAL (NOT NULL)
isOpen: BOOLEAN (NOT NULL)
ownerId: UUID (FK → Users.id)
createdAt: TIMESTAMP (NOT NULL)
Relación:
 Una tienda pertenece a un usuario (store_admin)
📦 Tabla: Packs
Representa los paquetes/productos que ofrece cada tienda.
Campos:
id: UUID (PK, NOT NULL)
storeId: UUID (FK → Stores.id)
title: TEXT (NOT NULL)
description: TEXT
packType: TEXT (NOT NULL) → valores: surprise, fixed
price: INTEGER (NOT NULL)
originalPrice: INTEGER
pickupStart: TIMESTAMP (NOT NULL)
pickupEnd: TIMESTAMP (NOT NULL)
totalQuantity: INTEGER (NOT NULL)
remainingQuantity: INTEGER (NOT NULL)
status: TEXT (NOT NULL) → valores: active, sold_out, expired
createdAt: TIMESTAMP (NOT NULL)
Relación:
 Un pack pertenece a una tienda
❤️ Tabla: Favorites
Relaciona usuarios con tiendas favoritas.
Campos:
id: UUID (PK, NOT NULL)
userId: UUID (FK → Users.id)
storeId: UUID (FK → Stores.id)
createdAt: TIMESTAMP (NOT NULL)
Relación:
 Muchos a muchos entre Users y Stores
📋 Tabla: Reservations
Representa los pedidos/reservas de los usuarios.
Campos:
id: UUID (PK, NOT NULL)
userId: UUID (FK → Users.id)
packId: UUID (FK → Packs.id)
quantity: INTEGER (NOT NULL)
status: TEXT (NOT NULL) → valores: reserved, picked_up, cancelled, expired
pickupCode: TEXT (NOT NULL)
createdAt: TIMESTAMP (NOT NULL)
Relaciones:
 Un usuario puede hacer múltiples reservas
 Cada reserva pertenece a un pack
🔗 Relaciones clave del sistema
 Un User puede ser:
 Cliente (consumer)
 Dueño de tienda (store_admin)
 Un Store:
 Pertenece a un usuario (owner)
 Tiene múltiples packs
 Un Pack:
 Pertenece a una tienda
 Puede tener múltiples reservas
 Un User:
 Puede tener múltiples favoritos
 Puede hacer múltiples reservas
🎯 Instrucción para el sistema
Usa este modelo para:
 Generar la base de datos (SQL o ORM)
 Crear los endpoints del backend
 Conectar con el frontend (cliente y tienda)
 Mantener consistencia en las relaciones