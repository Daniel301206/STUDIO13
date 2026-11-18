// Todos los textos de la sección Configuración se editan desde este archivo.

export const comoFunciona = {
  titulo: "Cómo funciona el panel",
  etiqueta: "Guía rápida",
  descripcion:
    "Desde aquí se administra el contenido de la web de Studio 13: Portafolio, Servicios, Paquetes, membresías, reservaciones y campañas.",
  pasos: [
    {
      titulo: "Agregar contenido",
      descripcion:
        "Entra a la sección correspondiente (Servicios, Paquetes o Campañas) y pulsa el botón de alta para crear un registro nuevo.",
    },
    {
      titulo: "Editar contenido",
      descripcion:
        "Selecciona el botón Editar de cualquier registro para actualizar sus datos, precios, imágenes o visibilidad.",
    },
    {
      titulo: "Eliminar contenido",
      descripcion:
        "Usa el botón Eliminar del registro que ya no necesites y confirma la acción. Esta operación no se puede deshacer.",
    },
    {
      titulo: "Subir fotos al portafolio",
      descripcion:
        "En Galería elige una sección, pulsa Agregar fotografía y selecciona una imagen de la biblioteca. También puedes administrar la biblioteca de imágenes.",
    },
    {
      titulo: "Cerrar sesión",
      descripcion:
        "Al terminar, pulsa Cerrar sesión en el menú lateral o en la tarjeta Ajustes para proteger el acceso al panel.",
    },
  ],
};

export const desarrolladoPor = {
  titulo: "Desarrollado por",
  etiqueta: "Equipo",
  descripcion: "Responsables del diseño y desarrollo de este panel administrativo.",
  integrantes: [
    {
      nombre: "Daniel Rivera",
      rol: "Desarrollador web",
      github: "",
      linkedin: "",
    },
  ],
};

export const contactoSoporte = {
  titulo: "Contacto y soporte",
  etiqueta: "Ayuda",
  descripcion: "Escríbenos si necesitas asistencia con el panel o encuentras algún problema.",
  correo: "daniel3012riberr@gmail.com",
  whatsapp: "985364324",
  // Ajusta el código de país si el enlace de WhatsApp debe abrir otro número.
  whatsappEnlace: "https://wa.me/505985364324",
};

export const informacionSistema = {
  titulo: "Información del sistema",
  etiqueta: "Sistema",
  descripcion: "Datos técnicos de la versión actual del panel administrativo.",
  version: "v1.0",
  tecnologias: ["React", "Vite", "Tailwind CSS", "Node.js", "Express", "PostgreSQL", "Prisma"],
  anio: "2026",
  propietario: "Studio 13",
  manual: {
    titulo: "Manual del panel administrativo",
    descripcion:
      "Consulta la guía paso a paso para gestionar clientes, reservaciones, paquetes, membresías, galería, campañas y publicidad.",
    boton: "Descargar manual (.docx)",
    archivo: "Manual_Administrativo_Studio13.docx",
    pendiente: "Manual pendiente de incorporación",
  },
};

export const ajustes = {
  titulo: "Ajustes",
  etiqueta: "Seguridad",
  descripcion: "Actualiza la contraseña de acceso y cierra la sesión cuando termines.",
  formularioTitulo: "Cambiar contraseña",
  ayudaContrasena: "La nueva contraseña debe tener entre 12 y 72 caracteres.",
  exito: "Contraseña actualizada correctamente.",
  cerrarSesion: "Cerrar sesión",
  cerrarSesionAyuda: "Finaliza la sesión administrativa en este dispositivo.",
};
