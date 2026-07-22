# ODF Manual Interactivo

> Guía web interactiva para apoyar la documentación, el diseño y el etiquetado de tableros ODF (*Optical Distribution Frame*) en subestaciones eléctricas.

[Ver el sitio](https://juliogb01.github.io/ODF_Manual_Interactivo/)

El manual reúne criterios de nomenclatura, equipos, cables, patchcords, celdas, casetes, alimentación y configuraciones típicas. Incluye un decodificador de etiquetas y una práctica breve para reforzar la revisión documental.

## Contenido

- Decodificador de etiquetas con validación de formato.
- Referencias de equipos y tensiones de operación.
- Criterios para cables de alimentación, UTP y fibra.
- Orientación sobre celdas, casetes y patchcords.
- Recorrido del sistema de energía.
- Comparación de configuraciones simples y redundantes.
- Quiz de revisión con errores frecuentes.

## Uso local

No requiere instalación ni dependencias. Clona el repositorio y abre `index.html`:

```powershell
git clone https://github.com/JulioGB01/ODF_Manual_Interactivo.git
cd ODF_Manual_Interactivo
start index.html
```

## Estructura

```text
.
├── index.html                    # Punto de entrada para GitHub Pages
├── style.css                     # Estilos de la interfaz
├── script.js                     # Decodificador, quiz y comportamiento
├── ODF_Manual_Interactivo.html   # Versión monolítica de referencia
└── .github/workflows/static.yml  # Despliegue estático
```

## Publicación

El workflow incluido despliega la rama `main` en GitHub Pages. Activa **Settings → Pages → GitHub Actions** para publicar la versión actual.

## Alcance y uso responsable

Este repositorio es una referencia técnica educativa. No sustituye las especificaciones del proyecto, normas aplicables, planos aprobados, procedimientos de seguridad ni la revisión de un profesional competente.

No publiques en este repositorio información operacional o confidencial: diagramas de red reales, credenciales, direcciones IP, nombres de clientes, ubicaciones de infraestructura, fotografías sensibles o detalles de seguridad física. Verifica siempre el contenido contra la documentación vigente del proyecto antes de aplicarlo en campo.

## Contribuciones

Consulta [`CONTRIBUTING.md`](CONTRIBUTING.md) antes de proponer cambios.