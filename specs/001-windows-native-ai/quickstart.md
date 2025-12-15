# Guía de Inicio Rápido: ContPAQ-Win

**Versión**: 1.0.0
**Fecha**: 2025-12-15

## Requisitos del Sistema

### Hardware Mínimo
- Procesador: Intel Core i5 o AMD equivalente
- RAM: 8 GB
- Espacio en disco: 2 GB disponibles
- Resolución de pantalla: 1366x768 o superior

### Software Requerido
- Windows 10 (21H2 o posterior) o Windows 11
- ContPAQi Comercial o Contabilidad (versión 2022 o posterior) con licencia activa
- Conexión a internet (solo para instalación inicial)

## Instalación

### Paso 1: Descargar el Instalador
1. Descargue `ContPAQ-Win-Setup.exe` desde el sitio oficial
2. Verifique que el archivo no esté bloqueado (clic derecho → Propiedades → Desbloquear)

### Paso 2: Ejecutar Instalación
1. Ejecute el instalador como administrador
2. Acepte los términos de licencia
3. El instalador verificará e instalará automáticamente:
   - Python Runtime 3.11
   - .NET 8.0 Runtime
   - Visual C++ Redistributable 2022
   - Tesseract OCR (para PDFs escaneados)

### Paso 3: Configuración Inicial
1. Al primer inicio, seleccione la empresa de ContPAQi a utilizar
2. Verifique que el indicador de estado muestre "Listo" en verde

### Instalación Silenciosa (Empresas)
```cmd
ContPAQ-Win-Setup.exe /SILENT /NORESTART
```

## Uso Básico

### Procesar una Factura

1. **Abrir PDF**
   - Haga clic en "Abrir Factura" o arrastre el archivo PDF
   - El sistema detecta automáticamente si es texto o imagen escaneada

2. **Revisar Extracción**
   - Los campos extraídos se muestran con indicadores de confianza:
     - 🟢 Verde (≥90%): Alta confianza
     - 🟠 Naranja (70-89%): Revisar recomendado
     - 🔴 Rojo (<70%): Verificación manual requerida
   - Haga clic en cualquier campo para editarlo

3. **Validar Datos**
   - Revise todos los campos, especialmente los marcados en naranja/rojo
   - El sistema valida automáticamente el formato RFC y cumplimiento CFDI
   - Haga clic en "Validar" cuando los datos sean correctos

4. **Enviar a ContPAQi**
   - Haga clic en "Enviar a ContPAQi"
   - Si se detecta duplicado, confirme si desea continuar
   - El número de folio se muestra al completar exitosamente

### Estados de Factura

| Estado | Descripción | Acciones Disponibles |
|--------|-------------|---------------------|
| Subida | PDF recibido | Procesar |
| Extraída | IA completó extracción | Editar, Validar |
| Validada | Usuario verificó datos | Editar, Enviar |
| Enviada | En ContPAQi | Ver en ContPAQi |

## Solución de Problemas

### El servicio de IA no inicia
1. Verifique que Python esté instalado correctamente
2. Revise el registro de eventos de Windows
3. Reinicie la aplicación

### Error de conexión con ContPAQi
1. Verifique que ContPAQi esté instalado y licenciado
2. Asegúrese que la empresa esté seleccionada
3. Cierre otras aplicaciones que usen ContPAQi

### Baja precisión en PDFs escaneados
1. Asegúrese que el escaneo sea al menos 150 DPI
2. Verifique que la imagen esté derecha y bien iluminada
3. Evite escaneos de fotocopias

### La aplicación no responde
1. Espere 30 segundos para que el servicio de IA inicie
2. Verifique el indicador de estado en la barra inferior
3. Si persiste, reinicie la aplicación

## Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| Ctrl+O | Abrir factura |
| Ctrl+S | Guardar cambios |
| Ctrl+Enter | Validar y enviar |
| F5 | Reprocesar con IA |
| Esc | Cancelar operación |

## Soporte

- **Documentación**: [enlace a docs]
- **Correo**: soporte@contpaq-win.com
- **Horario**: Lunes a Viernes, 9:00-18:00 (CST)
