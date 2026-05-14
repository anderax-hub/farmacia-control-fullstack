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
        [HttpPost]
        public async Task<ActionResult<Usuario>> CrearUsuario(Usuario usuario)
        {
            _contexto.Usuarios.Add(usuario);
            await _contexto.SaveChangesAsync();

            return Ok(usuario);
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

    }
}