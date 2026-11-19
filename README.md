# ascii-bouquet

Un ramo de lirios en 3D dibujado con caracteres ASCII, hecho como regalo. Se renderiza en el navegador con WebGL2 y se publica como sitio estático en Cloudflare Workers.

Incluye:

- **Ramo 3D** que crece, florece y se envuelve en papel, con pétalos ASCII que caen.
- **Contador** del tiempo que llevan juntos (años, meses, días, horas, minutos y segundos).
- **Cumplemes:** cada mes, en el día de inicio, aparece un mensaje y un campo de flores 3D alrededor del ramo.
- **Aniversario:** mensaje especial el mismo día y mes del inicio.
- **Cumpleaños:** el ramo se reemplaza por un pastel 3D con velas en forma de la edad, más un estallido de confeti.

Todos los nombres, fechas y textos salen de un archivo `.env`, así que el código no contiene datos personales.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior
- Una cuenta de [Cloudflare](https://dash.cloudflare.com/) (solo para publicar)
- Un navegador con soporte para WebGL2

## Uso rápido

```bash
# 1. Crea tu archivo de configuración a partir del ejemplo
cp .env.example .env

# 2. Edita .env con tus nombres y fechas (ver la tabla de abajo)

# 3. Genera la página
npm run build

# 4. Abre public/index.html en el navegador para verla
```

## Variables de `.env`

Las fechas usan el formato `AAAA-MM-DD`.

### Obligatorias

| Variable | Qué significa | Ejemplo |
|---|---|---|
| `NAME_A` | Primer nombre que aparece en el contador (`NAME_A ♥ NAME_B`). | `Ana` |
| `NAME_B` | Segundo nombre del contador. | `Beto` |
| `START_DATE` | Fecha en que empezaron. El contador parte a las 00:00 de ese día. El **día** de esta fecha activa el cumplemes cada mes, y el **día y mes** activan el aniversario. | `2025-01-01` |
| `BIRTHDAY_NAME` | Nombre de la persona que está de cumpleaños. Se usa en el mensaje de cumpleaños. | `Ana` |
| `BIRTHDAY_DATE` | Fecha de nacimiento. El **día y mes** activan el tema de cumpleaños (pastel y confeti) y el **año** sirve para calcular la edad. | `2000-01-01` |

### Opcionales

| Variable | Qué significa | Valor por defecto |
|---|---|---|
| `PAGE_TITLE` | Título de la pestaña del navegador y de la vista previa al compartir el enlace. | El de la plantilla |
| `FAVICON` | Ícono de la pestaña: un emoji. | `💐` |
| `SEED` | Texto cualquiera del que se genera la forma del ramo, del campo y del pastel: posición de cada lirio, curvatura de tallos y hojas, chispas, etc. El mismo texto siempre da el mismo ramo; cambiarlo da uno distinto. | `ascii-bouquet` |
| `MSG_MONTHIVERSARY` | Mensaje del cumplemes. | `feliz cumple mes 💐` |
| `MSG_ANNIVERSARY_FIRST` | Mensaje del primer aniversario. | `feliz aniversario 💐` |
| `MSG_ANNIVERSARY` | Mensaje de los aniversarios siguientes. `{n}` se reemplaza por los años juntos. | `feliz {n} años 💐` |
| `MSG_BIRTHDAY` | Mensaje de cumpleaños. `{age}` se reemplaza por la edad y `{name}` por `BIRTHDAY_NAME`. | `¡felices {age}, {name}! 🎂` |
| `ENABLE_TEST` | `true` habilita las vistas previas con `?test=` (ver abajo). Úsalo solo para probar en local. `npm run deploy` siempre lo desactiva. | `false` |

> `.env` está en `.gitignore`: tus datos no se suben al repositorio. Ten en cuenta que, una vez publicada, la página sí contiene esos valores (cualquiera puede verlos en el código fuente del sitio).

## Probar las fechas especiales

Para ver los temas sin esperar a la fecha:

1. Pon `ENABLE_TEST=true` en `.env`.
2. Ejecuta `npm run build`.
3. Abre `public/index.html` agregando uno de estos parámetros a la URL:

| Parámetro | Muestra |
|---|---|
| `?test=mes` | Cumplemes: mensaje y campo de flores |
| `?test=anio` | Aniversario |
| `?test=cumple` | Cumpleaños: pastel, velas y confeti |

## Controles

| Acción | Computador | Celular |
|---|---|---|
| Girar el ramo | Arrastrar con el mouse | Arrastrar con un dedo |
| Zoom | Rueda del mouse o barra **Zoom** | Pellizcar con dos dedos o barra **Zoom** |
| Subir o bajar la cámara | Shift + arrastrar, o arrastrar con el botón derecho | Deslizar con dos dedos hacia arriba o abajo |
| Opciones | Barra inferior | Botón ⚙ abajo a la derecha |

En las opciones:

- **Detalle:** cambia el tamaño de los caracteres.
- **Bordes:** activa o desactiva los contornos.
- **Rotar:** activa o desactiva el giro automático.
- **Volver a florecer:** repite la animación. El día del cumpleaños cambia a **¡Otra vez! 🎉**.

## Publicar en Cloudflare

La configuración está en [`wrangler.jsonc`](wrangler.jsonc):

- `name`: nombre del Worker.
- `routes`: dominio propio donde se publica. Cambia `pattern` por tu dominio o subdominio; el dominio debe estar en tu cuenta de Cloudflare.
- `workers_dev: false`: desactiva la URL `*.workers.dev`. Si no tienes dominio propio, quita `routes` y pon `true`.

Inicia sesión una vez:

```bash
npx wrangler login
```

También puedes definir `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` como variables de entorno.

Luego publica:

```bash
npm run deploy
```

El comando genera la página en modo producción, con las vistas previas `?test=` desactivadas, y la sube.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run build` | Genera `public/index.html` a partir de `src/index.html` y `.env`. |
| `npm run deploy` | Build de producción y publicación en Cloudflare. |

## Estructura

```
src/index.html    Plantilla de la página: el código del ramo, con datos de ejemplo
build.mjs         Inyecta los valores de .env en la plantilla y escribe public/
.env.example      Plantilla de configuración documentada
.env              Tu configuración (no se versiona)
public/           Página generada (no se versiona)
wrangler.jsonc    Configuración de Cloudflare Workers
```

Para modificar la página, edita `src/index.html` y vuelve a ejecutar `npm run build`. No edites `public/index.html`: se sobrescribe en cada build.
