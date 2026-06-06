# Base de datos

Este respaldo contiene la estructura y los datos actuales de la base:

```txt
farmacia_control.sql
```

Para restaurarla en otro equipo:

1. Instalar XAMPP.
2. Iniciar MySQL desde XAMPP.
3. Desde la raiz del repositorio, ejecutar:

```bat
C:\xampp\mysql\bin\mysql.exe -u root < database\farmacia_control.sql
```

El archivo crea la base `farmacia_control` y carga sus tablas y datos.
