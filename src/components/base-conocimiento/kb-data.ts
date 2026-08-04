/**
 * Contenido de la base de conocimiento.
 *
 * Los artículos se agrupan por categorías que reflejan los módulos reales
 * de la aplicación. Cada artículo incluye una introducción y una lista de
 * pasos o puntos clave que se muestran de forma expandible.
 */
import type { NombreIlustracion } from "./kb-illustrations";

export interface Articulo {
  /** Identificador único (usado para anclas y búsqueda). */
  id: string;
  titulo: string;
  /** Resumen breve mostrado bajo el título. */
  resumen: string;
  /** Cuerpo del artículo: pasos, consejos o aclaraciones. */
  puntos: string[];
  /** Palabras clave adicionales para la búsqueda. */
  etiquetas: string[];
}

export interface Categoria {
  id: string;
  titulo: string;
  descripcion: string;
  /** Nombre del icono de lucide-react (se resuelve en el componente). */
  icono: string;
  ilustracion: NombreIlustracion;
  articulos: Articulo[];
}

export const CATEGORIAS: Categoria[] = [
  {
    id: "primeros-pasos",
    titulo: "Primeros pasos",
    descripcion:
      "Familiarízate con el panel, la navegación y las acciones básicas de ImpresiónWeb.",
    icono: "Rocket",
    ilustracion: "dashboard",
    articulos: [
      {
        id: "que-es",
        titulo: "¿Qué es ImpresiónWeb?",
        resumen:
          "Una plataforma para gestionar proyectos de impresión, salidas de material, inventario, tintas, incidencias y reportes desde un único panel.",
        puntos: [
          "Centraliza toda la operación de impresión en un solo lugar, en español y con modo claro/oscuro.",
          "Cada módulo del menú lateral corresponde a un área: Proyectos, Salidas, Recogidas, Mapa visual, Inventario, Tintas y papel, Incidencias, Reportes y Configuración.",
          "El acceso es privado: solo los usuarios que han iniciado sesión pueden ver o modificar la información. Hay dos roles: administrador (control total) y solo lectura.",
        ],
        etiquetas: ["introducción", "resumen", "plataforma", "impresión"],
      },
      {
        id: "navegacion",
        titulo: "Cómo moverte por el panel",
        resumen:
          "El menú lateral izquierdo da acceso a todos los módulos; la cabecera superior muestra tu empresa y tu cuenta.",
        puntos: [
          "Usa el menú lateral para cambiar entre módulos. En móvil se abre con el botón de menú de la cabecera.",
          "El elemento activo se resalta en color para que sepas dónde estás en todo momento.",
          "Desde el menú de usuario (arriba a la derecha) puedes cambiar el tema y cerrar sesión.",
        ],
        etiquetas: ["navegación", "menú", "sidebar", "móvil", "responsive"],
      },
      {
        id: "buscar-ordenar",
        titulo: "Buscar, ordenar y paginar",
        resumen:
          "Los listados incluyen un buscador con resultados en tiempo real, ordenación y paginación.",
        puntos: [
          "Escribe en el buscador para filtrar los resultados; la búsqueda se aplica automáticamente tras una breve pausa.",
          "Usa el selector de orden para cambiar el criterio (por nombre, fecha, etc.).",
          "Cuando hay muchos elementos, navega entre páginas con los controles de paginación al final de la lista.",
        ],
        etiquetas: ["buscar", "filtrar", "ordenar", "paginar", "listado"],
      },
    ],
  },
  {
    id: "cuenta-seguridad",
    titulo: "Cuenta y seguridad",
    descripcion:
      "Inicio de sesión, datos del administrador y control de acceso privado.",
    icono: "ShieldCheck",
    ilustracion: "seguridad",
    articulos: [
      {
        id: "iniciar-sesion",
        titulo: "Iniciar sesión",
        resumen:
          "El panel es privado. Introduce tu correo y contraseña de administrador para acceder.",
        puntos: [
          "Accede desde la pantalla de inicio de sesión con el correo y la contraseña del administrador.",
          "No existe registro público: las cuentas las gestiona el administrador desde Configuración.",
          "Si intentas abrir cualquier página sin haber iniciado sesión, se te redirige automáticamente al login.",
        ],
        etiquetas: ["login", "acceso", "contraseña", "privado", "sesión"],
      },
      {
        id: "datos-admin",
        titulo: "Actualizar tus datos de acceso",
        resumen:
          "Cambia el nombre, el correo o la contraseña del administrador desde Configuración.",
        puntos: [
          "Ve a Configuración → datos del administrador para editar tu nombre y correo.",
          "Para cambiar la contraseña, introdúcela en el campo correspondiente y guarda los cambios.",
          "Usa una contraseña robusta: es la única llave de acceso a toda la información.",
        ],
        etiquetas: ["contraseña", "administrador", "correo", "cuenta", "seguridad"],
      },
      {
        id: "roles",
        titulo: "Roles: administrador y solo lectura",
        resumen:
          "Hay dos tipos de acceso: administrador (control total) y solo lectura (limitado).",
        puntos: [
          "El administrador puede ver y gestionar todos los módulos de la aplicación.",
          "El usuario de solo lectura solo puede ver Proyectos y Salidas, y solicitar recogidas; no puede crear, editar, eliminar ni aprobar.",
          "El administrador gestiona el correo y la contraseña del usuario de solo lectura desde Configuración → Usuario de solo lectura.",
        ],
        etiquetas: ["rol", "lector", "solo lectura", "permisos", "administrador", "acceso"],
      },
      {
        id: "acceso-privado",
        titulo: "Por qué el acceso es privado",
        resumen:
          "Todas las rutas del panel están protegidas; solo usuarios autenticados pueden usarlas.",
        puntos: [
          "La protección se aplica a nivel de toda la aplicación, no página por página.",
          "Al cerrar sesión, se revoca el acceso y hay que volver a autenticarse para continuar.",
          "Los datos sensibles (proyectos, inventario, reportes) nunca son visibles para usuarios no autenticados.",
        ],
        etiquetas: ["privado", "seguridad", "protección", "autenticación"],
      },
    ],
  },
  {
    id: "proyectos",
    titulo: "Proyectos e impresiones",
    descripcion:
      "Crea proyectos, registra impresiones y controla el bloqueo de solo lectura.",
    icono: "FolderKanban",
    ilustracion: "proyectos",
    articulos: [
      {
        id: "crear-proyecto",
        titulo: "Crear y editar un proyecto",
        resumen:
          "Los proyectos agrupan impresiones y salidas. Incluyen nombre y una ruta de impresión.",
        puntos: [
          "Pulsa el botón de nuevo proyecto, completa el nombre y la ruta de impresión y guarda.",
          "Desde el listado puedes editar o eliminar cualquier proyecto que no esté bloqueado.",
          "Abre un proyecto para ver su detalle con sus impresiones y salidas asociadas.",
        ],
        etiquetas: ["proyecto", "crear", "editar", "ruta", "impresión"],
      },
      {
        id: "registrar-impresiones",
        titulo: "Registrar impresiones",
        resumen:
          "Dentro de un proyecto puedes añadir impresiones con nombre, cantidad y tiempo.",
        puntos: [
          "En el detalle del proyecto, añade una impresión indicando su nombre, cantidad y tiempo invertido.",
          "La fecha se registra automáticamente en el momento de crearla.",
          "Las impresiones alimentan las estadísticas del Dashboard y los Reportes.",
        ],
        etiquetas: ["impresión", "cantidad", "tiempo", "registro"],
      },
      {
        id: "bloqueo-proyectos",
        titulo: "Bloquear proyectos (solo lectura)",
        resumen:
          "Un proyecto bloqueado queda protegido: no se puede editar ni modificar su contenido.",
        puntos: [
          "Los proyectos bloqueados se resaltan en el listado para identificarlos rápidamente.",
          "Mientras estén bloqueados no se pueden editar ni eliminar, ni cambiar sus impresiones o salidas.",
          "Desbloquear requiere una confirmación explícita, para evitar cambios accidentales.",
        ],
        etiquetas: ["bloqueo", "solo lectura", "proteger", "confirmación"],
      },
      {
        id: "estado-prioridad-proyecto",
        titulo: "Estados y prioridad de proyectos",
        resumen:
          "Cada proyecto puede marcarse con estado, prioridad y fechas de planificación.",
        puntos: [
          "Usa el estado para indicar si un proyecto está pendiente, en producción, pausado, terminado o cancelado.",
          "La prioridad ayuda a ordenar el trabajo: baja, media, alta o urgente.",
          "Las fechas de inicio y entrega alimentan el Calendario de producción y permiten anticipar cargas de trabajo.",
        ],
        etiquetas: ["estado", "prioridad", "planificación", "entrega", "producción"],
      },
    ],
  },
  {
    id: "calendario",
    titulo: "Calendario de producción",
    descripcion:
      "Visualiza proyectos planificados por fecha de inicio y entrega.",
    icono: "CalendarDays",
    ilustracion: "dashboard",
    articulos: [
      {
        id: "usar-calendario",
        titulo: "Planificar proyectos en el calendario",
        resumen:
          "El calendario muestra los proyectos que tienen fecha de inicio o entrega configurada.",
        puntos: [
          "Edita un proyecto y define fecha de inicio, fecha de entrega, estado y prioridad.",
          "En Calendario verás cada evento en el día correspondiente: Inicio o Entrega.",
          "Pulsa sobre cualquier evento para abrir el detalle del proyecto y revisar impresiones, salidas y notas.",
        ],
        etiquetas: ["calendario", "producción", "inicio", "entrega", "planificar"],
      },
      {
        id: "priorizar-produccion",
        titulo: "Priorizar la producción",
        resumen:
          "Combina prioridad, estado y fechas para decidir qué revisar primero.",
        puntos: [
          "Los proyectos urgentes se identifican con una etiqueta diferenciada.",
          "Un proyecto pausado o cancelado sigue visible si tiene fechas, para que no se pierda contexto de planificación.",
          "La vista mensual ayuda a detectar semanas cargadas antes de que lleguen los vencimientos.",
        ],
        etiquetas: ["urgente", "estado", "prioridad", "vencimiento", "carga"],
      },
    ],
  },
  {
    id: "salidas",
    titulo: "Salidas de material",
    descripcion:
      "Registra las unidades de un proyecto que se envían a un destino concreto.",
    icono: "Truck",
    ilustracion: "salidas",
    articulos: [
      {
        id: "registrar-salida",
        titulo: "Registrar una salida",
        resumen:
          "Una salida representa unidades de un proyecto enviadas a un destino.",
        puntos: [
          "Crea una salida seleccionando el proyecto, el destino y la cantidad de unidades.",
          "Cada salida queda asociada a su proyecto para mantener la trazabilidad.",
          "Las salidas no pueden modificarse si el proyecto está bloqueado.",
          "Las recogidas de trabajadores aprobadas se registran aquí automáticamente como una salida.",
        ],
        etiquetas: ["salida", "material", "destino", "unidades", "envío", "recogida"],
      },
      {
        id: "seguimiento-salidas",
        titulo: "Consultar el historial de salidas",
        resumen:
          "El listado de salidas permite buscar, ordenar y revisar todos los envíos realizados.",
        puntos: [
          "Filtra por destino o proyecto con el buscador para localizar una salida concreta.",
          "Ordena por fecha para ver los envíos más recientes primero.",
          "Los datos de salidas se incluyen en los reportes exportables.",
        ],
        etiquetas: ["historial", "seguimiento", "trazabilidad", "listado"],
      },
    ],
  },
  {
    id: "recogidas",
    titulo: "Recogidas por QR",
    descripcion:
      "Los trabajadores registran las unidades que cogen; el administrador las aprueba.",
    icono: "Package",
    ilustracion: "salidas",
    articulos: [
      {
        id: "que-son-recogidas",
        titulo: "Cómo funcionan las recogidas",
        resumen:
          "Un trabajador registra que coge unidades de un proyecto; queda pendiente hasta que el administrador la aprueba.",
        puntos: [
          "El trabajador indica su NBI (identificador), su nombre, el proyecto y las unidades que coge.",
          "Cada recogida queda en estado Pendiente: nada se descuenta automáticamente.",
          "Al aprobarla, el administrador genera una salida del proyecto (se descuenta); al denegarla, no se descuenta nada.",
        ],
        etiquetas: ["recogida", "trabajador", "nbi", "pendiente", "aprobar"],
      },
      {
        id: "qr-recogidas",
        titulo: "El código QR para trabajadores",
        resumen:
          "Un QR con enlace secreto abre el formulario de recogida, sin necesidad de cuentas.",
        puntos: [
          "En Recogidas puedes generar el QR, copiar el enlace, imprimirlo y colocarlo en el taller.",
          "Los trabajadores lo escanean y rellenan el formulario; no necesitan cuenta ni contraseña.",
          "Si sospechas que el enlace se ha filtrado, regenera el QR: el anterior deja de funcionar al instante.",
        ],
        etiquetas: ["qr", "enlace", "escanear", "taller", "regenerar"],
      },
      {
        id: "aprobar-recogidas",
        titulo: "Aprobar o denegar recogidas",
        resumen:
          "Desde el módulo Recogidas revisas las solicitudes y decides si se descuentan.",
        puntos: [
          "Filtra por Pendientes para ver lo que espera tu decisión (el contador te avisa).",
          "Aprobar registra las unidades como salida del proyecto (se descuentan) y marca la recogida como Aprobada.",
          "Denegar la marca como Denegada sin descontar nada. Nada cambia sin tu confirmación.",
        ],
        etiquetas: ["aprobar", "denegar", "pendiente", "descontar", "salida"],
      },
      {
        id: "solicitar-recogida",
        titulo: "Solicitar una recogida desde la app",
        resumen:
          "El usuario de solo lectura, ya dentro de la app, puede solicitar recogidas sin escanear el QR.",
        puntos: [
          "Desde Salidas, el usuario de solo lectura pulsa \"Solicitar recogida\" y rellena NBI, nombre, proyecto y unidades.",
          "La solicitud queda igualmente Pendiente de la aprobación del administrador.",
          "Es la vía cómoda para quien ya tiene acceso, sin tener que usar el código QR.",
        ],
        etiquetas: ["solicitar", "lector", "solo lectura", "sin qr", "pendiente"],
      },
    ],
  },
  {
    id: "mapa-visual",
    titulo: "Mapa visual",
    descripcion:
      "Diseña estancias, dibuja zonas de almacenaje y ubica impresiones de proyectos.",
    icono: "Map",
    ilustracion: "inventario",
    articulos: [
      {
        id: "crear-estancias",
        titulo: "Crear estancias del taller",
        resumen:
          "Una estancia representa una sala o zona física: Sala impresión, Almacén, Expediciones, etc.",
        puntos: [
          "Desde Mapa visual pulsa Nueva estancia para crear cada sala o almacén que quieras representar.",
          "El nombre y la descripción ayudan a diferenciar espacios cuando hay más de una estancia.",
          "Puedes editar o eliminar una estancia; al eliminarla también se eliminan sus zonas y ubicaciones asociadas.",
        ],
        etiquetas: ["mapa", "estancia", "sala", "almacén", "zona física"],
      },
      {
        id: "dibujar-zonas",
        titulo: "Dibujar y modificar zonas",
        resumen:
          "Cada zona es un área de almacenaje dentro de una estancia.",
        puntos: [
          "Activa Dibujar zona y arrastra sobre el lienzo para crear un área nueva.",
          "Después puedes cambiar su nombre, color, descripción y tamaño desde el formulario de edición.",
          "Las zonas se pueden mover arrastrándolas y redimensionar desde la esquina inferior derecha.",
        ],
        etiquetas: ["zona", "dibujar", "lienzo", "canvas", "almacenaje"],
      },
      {
        id: "ubicar-impresiones",
        titulo: "Ubicar impresiones",
        resumen:
          "Asigna impresiones de proyectos a zonas para saber dónde está cada lote.",
        puntos: [
          "En cada tarjeta de zona pulsa Asignar impresión y selecciona la impresión del proyecto.",
          "La cantidad es opcional: puedes ubicar el lote completo o indicar solo una parte concreta.",
          "Ubicar impresiones no es obligatorio, pero el panel muestra cuántas quedan sin ubicación para mantener el control.",
        ],
        etiquetas: ["ubicación", "impresión", "lote", "cantidad", "trazabilidad"],
      },
    ],
  },
  {
    id: "inventario",
    titulo: "Inventario",
    descripcion:
      "Controla los artículos disponibles y sus cantidades en stock.",
    icono: "Package",
    ilustracion: "inventario",
    articulos: [
      {
        id: "gestionar-articulos",
        titulo: "Añadir y actualizar artículos",
        resumen:
          "Cada artículo del inventario tiene un nombre y una cantidad disponible.",
        puntos: [
          "Pulsa el botón de nuevo artículo, indica su nombre y su cantidad y guarda.",
          "Actualiza la cantidad cada vez que entre o salga material para mantener el stock al día.",
          "Usa el buscador, la ordenación y la paginación para gestionar inventarios grandes.",
        ],
        etiquetas: ["inventario", "artículo", "stock", "cantidad"],
      },
    ],
  },
  {
    id: "tintas-papel",
    titulo: "Tintas y papel",
    descripcion:
      "Configura las tintas, controla su nivel y el stock de rollos de papel.",
    icono: "Droplets",
    ilustracion: "tintas",
    articulos: [
      {
        id: "configurar-tintas",
        titulo: "Configurar las tintas",
        resumen:
          "Define cuántas tintas usa tu equipo (4, 6 o 9) y controla el nivel de cada una en porcentaje.",
        puntos: [
          "Elige la configuración inicial de tintas según tu impresora (4, 6 o 9 tintas).",
          "Ajusta el nivel de cada tinta en porcentaje a medida que se consume.",
          "Cada cambio queda registrado en el histórico para comparar el consumo.",
        ],
        etiquetas: ["tintas", "nivel", "porcentaje", "cmyk", "configurar"],
      },
      {
        id: "stock-papel",
        titulo: "Gestionar el stock de papel",
        resumen:
          "Lleva el control de los rollos de papel disponibles y su consumo.",
        puntos: [
          "Añade y actualiza la cantidad de rollos de papel en stock.",
          "Al modificar el stock, el histórico guarda el valor anterior y el actual.",
          "Los reportes muestran el consumo de papel comparando esos valores.",
        ],
        etiquetas: ["papel", "rollos", "stock", "consumo"],
      },
      {
        id: "historico-consumo",
        titulo: "Entender el consumo en los reportes",
        resumen:
          "El histórico permite que los reportes calculen cuánta tinta y papel se han consumido.",
        puntos: [
          "Cada registro compara el valor anterior con el nuevo para deducir el consumo.",
          "Así puedes anticipar reposiciones antes de quedarte sin material.",
          "Revisa el consumo por periodos en el módulo de Reportes.",
        ],
        etiquetas: ["consumo", "histórico", "reportes", "tinta", "papel"],
      },
    ],
  },
  {
    id: "incidencias",
    titulo: "Incidencias",
    descripcion:
      "Documenta incidencias con texto enriquecido y haz seguimiento por estados.",
    icono: "AlertTriangle",
    ilustracion: "incidencias",
    articulos: [
      {
        id: "crear-incidencia",
        titulo: "Crear una incidencia",
        resumen:
          "Registra cualquier incidencia con un editor de texto enriquecido para describirla en detalle.",
        puntos: [
          "Pulsa el botón de nueva incidencia y describe el problema con el editor enriquecido (negrita, listas, etc.).",
          "Asigna un estado para reflejar en qué punto de resolución se encuentra.",
          "Guarda para que quede registrada y visible en el listado.",
        ],
        etiquetas: ["incidencia", "crear", "editor", "texto enriquecido"],
      },
      {
        id: "estados-incidencia",
        titulo: "Estados y seguimiento",
        resumen:
          "Los estados con color permiten ver de un vistazo la situación de cada incidencia.",
        puntos: [
          "Filtra por estado para centrarte en las incidencias abiertas o pendientes.",
          "Actualiza el estado a medida que avanza la resolución.",
          "Abre una incidencia para consultar su descripción completa.",
        ],
        etiquetas: ["estado", "seguimiento", "filtro", "resolución"],
      },
    ],
  },
  {
    id: "reportes",
    titulo: "Reportes y exportación",
    descripcion:
      "Genera reportes por periodo y expórtalos a PDF o Excel, o imprímelos.",
    icono: "FileBarChart",
    ilustracion: "reportes",
    articulos: [
      {
        id: "generar-reporte",
        titulo: "Generar un reporte",
        resumen:
          "Elige el periodo (diario, semanal, mensual o personalizado) para ver la actividad correspondiente.",
        puntos: [
          "Selecciona un rango predefinido o define fechas personalizadas.",
          "El reporte reúne impresiones, salidas y consumo de tinta y papel del periodo.",
          "Los gráficos ayudan a interpretar la evolución de la actividad.",
        ],
        etiquetas: ["reporte", "periodo", "diario", "semanal", "mensual"],
      },
      {
        id: "exportar-reporte",
        titulo: "Exportar a PDF o Excel",
        resumen:
          "Descarga el reporte en PDF o Excel, o imprímelo directamente.",
        puntos: [
          "Usa el botón de PDF para obtener un documento listo para compartir o archivar.",
          "Usa el botón de Excel para trabajar los datos en una hoja de cálculo.",
          "También puedes imprimir el reporte directamente desde el navegador.",
        ],
        etiquetas: ["exportar", "pdf", "excel", "imprimir", "descargar"],
      },
    ],
  },
  {
    id: "auditoria",
    titulo: "Historial de auditoría",
    descripcion:
      "Revisa acciones administrativas y cambios críticos de la aplicación.",
    icono: "History",
    ilustracion: "seguridad",
    articulos: [
      {
        id: "consultar-auditoria",
        titulo: "Consultar el historial",
        resumen:
          "Auditoría registra acciones como crear, actualizar, eliminar, bloquear, aprobar o restaurar copias.",
        puntos: [
          "Entra en Auditoría para ver la fecha, acción, entidad, usuario y descripción de cada evento registrado.",
          "Usa el buscador para localizar actividad por usuario, módulo, acción o descripción.",
          "La auditoría ayuda a investigar cambios accidentales y a entender qué ocurrió antes de una incidencia.",
        ],
        etiquetas: ["auditoría", "historial", "seguridad", "usuario", "acción"],
      },
      {
        id: "que-se-registra",
        titulo: "Qué acciones quedan registradas",
        resumen:
          "Se registran acciones operativas importantes sin guardar contraseñas ni datos innecesarios.",
        puntos: [
          "Quedan registradas acciones sobre proyectos, impresiones, salidas, recogidas, inventario, tintas, papel, mapa, configuración y copias de seguridad.",
          "Las restauraciones de backup aparecen en el historial porque reemplazan datos de la aplicación.",
          "Los datos sensibles se evitan en la traza: el objetivo es trazabilidad, no duplicar información privada.",
        ],
        etiquetas: ["registro", "trazabilidad", "backup", "configuración", "privacidad"],
      },
    ],
  },
  {
    id: "configuracion",
    titulo: "Configuración y copias",
    descripcion:
      "Personaliza la empresa, el tema y protege tus datos con copias de seguridad.",
    icono: "Settings",
    ilustracion: "configuracion",
    articulos: [
      {
        id: "personalizar-empresa",
        titulo: "Personalizar empresa y tema",
        resumen:
          "Cambia el nombre de la empresa, el logo y el tema claro/oscuro de la aplicación.",
        puntos: [
          "En Configuración puedes actualizar el nombre de la empresa y el logo que se muestran en el panel.",
          "Alterna entre modo claro y oscuro según tu preferencia.",
          "Los cambios se aplican a toda la interfaz tras guardarlos.",
        ],
        etiquetas: ["configuración", "empresa", "logo", "tema", "personalizar"],
      },
      {
        id: "copias-seguridad",
        titulo: "Copias de seguridad y restauración",
        resumen:
          "Descarga un volcado completo de toda la aplicación y restáuralo cuando lo necesites.",
        puntos: [
          "La copia incluye TODA la app: proyectos, impresiones, salidas, recogidas, inventario, tintas, papel, incidencias, auditoría, configuración y usuarios.",
          "Descárgala en formato JSON y guárdala en un lugar seguro; es tu respaldo ante cualquier imprevisto.",
          "La restauración desde un archivo requiere una confirmación fuerte, ya que reemplaza los datos actuales. Solo el administrador puede descargar o restaurar.",
        ],
        etiquetas: ["backup", "copia", "seguridad", "restaurar", "json", "completa"],
      },
      {
        id: "gestionar-lector",
        titulo: "Gestionar el usuario de solo lectura",
        resumen:
          "Cambia el correo y la contraseña de la cuenta de solo lectura desde Configuración.",
        puntos: [
          "En Configuración → Usuario de solo lectura puedes actualizar su correo electrónico.",
          "Para cambiar su contraseña, escribe una nueva; déjala en blanco si no quieres cambiarla.",
          "Esa cuenta solo ve Proyectos y Salidas y puede solicitar recogidas, pero no modifica nada.",
        ],
        etiquetas: ["lector", "solo lectura", "correo", "contraseña", "gestionar"],
      },
    ],
  },
];
