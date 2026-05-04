A continuación se describe el flujo completo de la aplicación, dividido en dos partes: Usuario (cliente) y Tienda (establecimiento).  Este flujo define cómo interactúan ambos dentro del sistema.
👤 FLUJO DEL USUARIO (CLIENTE)
🚀 Inicio
 El usuario abre la aplicación.
 El sistema verifica:
 Si el usuario ya tiene cuenta → va a Login
 Si no tiene cuenta → va a Register
🔐 Autenticación
 El usuario:
 Inicia sesión (Login)
 O se registra (Register)
 Después de autenticarse → entra al Home
🧭 Navegación principal
 Desde el Home, el usuario puede explorar de dos formas:
 🔍 Explorar lista (Explore) → ver tiendas o productos
 🗺️ Mapa (Map) → ver tiendas cercanas según ubicación
📦 Búsqueda de packs
 El usuario navega hasta encontrar un pack:
 Si no encuentra → sigue explorando
 Si encuentra uno → entra al detalle
📄 Detalle del pack
 El usuario ve:
 Información del pack
 Precio
 Disponibilidad
 Decide reservar el pack
🛒 Reserva / Pedido
 El usuario realiza la reserva:
 Va a pantalla de confirmación
💳 Pago
 El usuario realiza el pago:
 Si falla → puede reintentar
 Si es exitoso → continúa
🎟️ Confirmación
 El sistema genera:
 Código de recogida (pickup code)
 Detalles del pedido
🏪 Recogida
 El usuario:
 Va físicamente a la tienda
 Muestra el código
✅ Final
 La tienda entrega el pack
 Fin del flujo
🏪 FLUJO DE LA TIENDA (ESTABLECIMIENTO)
🚀 Inicio
 La tienda abre la aplicación
 El sistema verifica:
 Si tiene cuenta → Login
 Si no → Register como negocio
🔐 Acceso
 La tienda entra al Dashboard
📊 Dashboard
 Desde el dashboard puede:
 Crear nuevos packs
 Gestionar packs existentes
📦 Gestión de packs
Crear pack
 La tienda:
 Crea un pack (sorpresa o fijo)
 Ingresa detalles (precio, cantidad, horario, etc.)
 Publica el pack
🛒 Recepción de pedidos
 Cuando un usuario reserva:
 La tienda recibe la orden
🔄 Estado de packs
 El sistema verifica:
 Si hay stock → sigue recibiendo pedidos
 Si se agota → se marca como “sold out”
👤 Llegada del cliente
 El cliente llega a la tienda
 Muestra su código de recogida
🔐 Verificación
 La tienda:
 Verifica el código
⚖️ Decisión
 Si el código es:
 ✅ Válido → entrega el pack
 ❌ Inválido → rechaza la orden
🏁 Final
 Pedido marcado como completado
 Fin del flujo
🔗 RELACIÓN ENTRE USUARIO Y TIENDA
 El usuario reserva un pack
 La tienda recibe y gestiona ese pedido
 El usuario recoge físicamente el producto
 La tienda valida y entrega
🧠 NOTAS IMPORTANTES PARA IMPLEMENTACIÓN
 No existe delivery (todo es recogida en tienda)
 El sistema gira alrededor de:
 Packs
 Reservas
 Validación por código
 El mapa es clave para descubrir tiendas cercanas
 El flujo debe ser simple y rápido (tipo marketplace)