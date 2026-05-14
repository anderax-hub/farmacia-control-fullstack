using FarmaciaControlAPI.Datos;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Servicios
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var conexion = builder.Configuration.GetConnectionString("ConexionMySQL");

builder.Services.AddDbContext<ContextoBD>(options =>
    options.UseMySql(conexion, ServerVersion.AutoDetect(conexion)));


builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirReact",
        politica =>
        {
            politica.WithOrigins("http://localhost:5173")
                    .AllowAnyHeader()
                    .AllowAnyMethod();
        });
});



var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("PermitirReact");

app.UseAuthorization();
    
app.MapControllers();

app.Run();