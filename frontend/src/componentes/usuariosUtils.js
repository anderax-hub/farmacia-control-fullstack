export const API_USUARIOS = 'https://localhost:7120/api/Usuarios'
export const ROLES_USUARIO = ['Administrador', 'Ventas', 'Inventario']
export const ADMINISTRADOR_PRINCIPAL_ID = 1

export const USUARIO_FORMULARIO_INICIAL = {
  nombre: '',
  correo: '',
  clave: '',
  rol: 'Ventas'
}

export const obtenerIdUsuario = (usuario) => Number(usuario?.id ?? usuario?.Id)

export const normalizarTexto = (valor) => {
  return String(valor || '').trim().toLowerCase()
}

export const esAdministradorPrincipal = (usuario) => {
  return obtenerIdUsuario(usuario) === ADMINISTRADOR_PRINCIPAL_ID
}

export const obtenerUsuarioActual = () => {
  try {
    return JSON.parse(localStorage.getItem('usuario') || 'null')
  } catch {
    return null
  }
}

export const esSesionActual = (usuario, usuarioActual = obtenerUsuarioActual()) => {
  return obtenerIdUsuario(usuario) === obtenerIdUsuario(usuarioActual)
}

export const puedeEliminarUsuario = (usuario, usuarioActual = obtenerUsuarioActual()) => {
  return !esAdministradorPrincipal(usuario) && !esSesionActual(usuario, usuarioActual)
}

export const crearFormularioDesdeUsuario = (usuario) => {
  return {
    nombre: usuario.nombre || '',
    correo: usuario.correo || '',
    clave: usuario.clave || '',
    rol: usuario.rol || 'Ventas'
  }
}

export const crearUsuarioDesdeFormulario = (formulario) => {
  return {
    nombre: formulario.nombre.trim(),
    correo: formulario.correo.trim(),
    clave: formulario.clave.trim(),
    rol: formulario.rol
  }
}

export const validarUsuarioFormulario = (usuario, usuarios = [], usuarioId = null) => {
  if (!usuario.nombre || !usuario.correo || !usuario.clave || !usuario.rol) {
    return 'Nombre, correo, clave y rol son obligatorios'
  }

  if (!ROLES_USUARIO.includes(usuario.rol)) {
    return 'Rol no permitido'
  }

  const existeCorreo = usuarios.some((usuarioExistente) => {
    return (
      usuarioExistente.id !== usuarioId &&
      normalizarTexto(usuarioExistente.correo) === normalizarTexto(usuario.correo)
    )
  })

  if (existeCorreo) {
    return 'Ya existe un usuario con ese correo'
  }

  return ''
}
