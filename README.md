# ODF — Manual Interactivo de Diseño y Etiquetado

> Manual técnico interactivo para documentación de Tableros ODF en subestaciones eléctricas.

**🔗 Ver en vivo:** [https://juliogb01.github.io/ODF_Manual_Interactivo](https://juliogb01.github.io/ODF_Manual_Interactivo)

---

## ¿Qué es esto?

Una referencia técnica en formato web para quienes dibujan planos *as-built* de Tableros ODF (Optical Distribution Frame) en subestaciones de alta y media tensión.

Cubre los tres pilares del trabajo:

| Sección | Contenido |
|---|---|
| **Decodificador de etiquetas** | Pegás cualquier rótulo de un plano y el sistema lo descompone en sus partes, verificando si cumple la norma |
| **Equipos** | SW210, SW211/SW221, FW240, CK231, C24 — nomenclatura, función y tensión de operación |
| **Cables y patchcords** | Alimentación, UTP cobre y fibra OM2 LC con criterio origen/destino |
| **Celdas y casetes** | Identificadores de celda, diferencia entre acrílico y etiqueta de patchcord |
| **Sistema de energía** | Camino completo desde la red de la subestación hasta los bornes de cada equipo |
| **Configuraciones típicas** | Simple vs redundante, ODF de pared vs de piso |
| **Práctica (Quiz)** | 12 preguntas sobre los errores más comunes en revisión |

---

## Estructura del proyecto

```
ODF_Manual_Interactivo/
├── index.html                  ← Punto de entrada (GitHub Pages)
├── style.css                   ← Estilos visuales
├── script.js                   ← Lógica interactiva (decodificador + quiz)
├── ODF_Manual_Interactivo.html ← Archivo monolítico original (referencia)
└── README.md                   ← Este archivo
```

---

## Uso local

No requiere servidor ni dependencias. Abrí `index.html` directamente en el navegador:

```bash
# Clonar el repositorio
git clone https://github.com/JulioGB01/ODF_Manual_Interactivo.git

# Abrir en el navegador
start index.html   # Windows
open index.html    # macOS
```

---

## Tecnologías

- HTML5 semántico
- CSS3 con variables custom (sin frameworks)
- JavaScript vanilla (sin dependencias)
- Tipografías: [Barlow Condensed](https://fonts.google.com/specimen/Barlow+Condensed), [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono), [Inter](https://fonts.google.com/specimen/Inter) vía Google Fonts

---

## Despliegue en GitHub Pages

El sitio se publica automáticamente desde la rama `main`. Para activarlo:

1. Ir a **Settings → Pages** del repositorio
2. En *Source* seleccionar **Deploy from a branch**
3. Seleccionar rama `main` y carpeta `/ (root)`
4. Guardar — en pocos minutos el sitio estará disponible

---

## Licencia

Documentación técnica interna. Todos los derechos reservados.
