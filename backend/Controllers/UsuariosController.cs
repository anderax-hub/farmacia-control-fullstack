using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FarmaciaControlAPI.Datos;
using FarmaciaControlAPI.Modelos;
using Microsoft.AspNetCore.Identity.Data;

namespace FarmaciaControlAPI.Controllers
{   
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private const int AdministradorPrincipalId = 1;
        private const string RolAdministrador = "Administrador";
        private readonly ContextoBD _contexto;

        public UsuariosController(ContextoBD contexto)
        {
            _contexto = contexto;
        }

        [HttpGet]
        public async Task<ActionResult<List<Usuario>>> ObtenerUsuarios()
        {
            var usuarios = await _contexto.Usuarios.ToListAsync();
            return Ok(usuarios);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Usuario>> ObtenerUsuario(int id)
        {
            var usuario = await _contexto.Usuarios.FindAsync(id);

            if (usuario == null)
            {
                return NotFound("Usuario no encontrado");
            }

            return Ok(usuario);
        }

        [HttpPost]
        public async Task<ActionResult<Usuario>> CrearUsuario(Usuario usuario)
        {
            var errorValidacion = await ValidarUsuario(usuario);

            if (errorValidacion != null)
            {
                return BadRequest(errorValidacion);
            }

            _contexto.Usuarios.Add(usuario);
            await _contexto.SaveChangesAsync();

            return Ok(usuario);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Usuario>> ActualizarUsuario(int id, Usuario usuarioActualizado)
        {
            var usuario = await _contexto.Usuarios.FindAsync(id);

            if (usuario == null)
            {
                return NotFound("Usuario no encontrado");
            }

            if (id == AdministradorPrincipalId && usuarioActualizado.Rol?.Trim() != RolAdministrador)
            {
                return BadRequest("No se puede cambiar el rol del administrador principal");
            }

            var errorValidacion = await ValidarUsuario(usuarioActualizado, id);

            if (errorValidacion != null)
            {
                return BadRequest(errorValidacion);
            }

            usuario.Nombre = usuarioActualizado.Nombre.Trim();
            usuario.Correo = usuarioActualizado.Correo.Trim();
            usuario.Clave = usuarioActualizado.Clave.Trim();
            usuario.Rol = usuarioActualizado.Rol.Trim();

            await _contexto.SaveChangesAsync();

            return Ok(usuario);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> EliminarUsuario(int id)
        {
            var usuario = await _contexto.Usuarios.FindAsync(id);

            if (usuario == null)
            {
                return NotFound("Usuario no encontrado");
            }

            if (id == AdministradorPrincipalId)
            {
                return BadRequest("No se puede eliminar el administrador principal");
            }

            var esAdministrador = usuario.Rol == RolAdministrador;
            var totalAdministradores = await _contexto.Usuarios
                .CountAsync(u => u.Rol == RolAdministrador);

            if (esAdministrador && totalAdministradores <= 1)
            {
                return BadRequest("No se puede eliminar el ultimo administrador");
            }

            _contexto.Usuarios.Remove(usuario);
            await _contexto.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("login")]
        public async Task<ActionResult<Usuario>> IniciarSesion([FromBody] LoginUsuario datos)
        {
            var usuario = await _contexto.Usuarios
                .FirstOrDefaultAsync(u => u.Correo == datos.Correo && u.Clave == datos.Clave);

            if (usuario == null)
            {
                return Unauthorized("Correo o clave incorrectos");
            }

            return Ok(usuario);
        }

        private async Task<string?> ValidarUsuario(Usuario usuario, int? usuarioId = null)
        {
            usuario.Nombre = usuario.Nombre.Trim();
            usuario.Correo = usuario.Correo.Trim();
            usuario.Clave = usuario.Clave.Trim();
            usuario.Rol = usuario.Rol.Trim();

            var rolesPermitidos = new[] { "Administrador", "Ventas", "Inventario" };

            if (string.IsNullOrWhiteSpace(usuario.Nombre) ||
                string.IsNullOrWhiteSpace(usuario.Correo) ||
                string.IsNullOrWhiteSpace(usuario.Clave) ||
                string.IsNullOrWhiteSpace(usuario.Rol))
            {
                return "Nombre, correo, clave y rol son obligatorios";
            }

            if (!rolesPermitidos.Contains(usuario.Rol))
            {
                return "Rol no permitido";
            }

            var existeCorreo = await _contexto.Usuarios.AnyAsync(u =>
                u.Id != usuarioId &&
                u.Correo.ToLower() == usuario.Correo.ToLower());

            if (existeCorreo)
            {
                return "Ya existe un usuario con ese correo";
            }

            return null;
        }

    }
}
