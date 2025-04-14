// ~/.config/ags/widgets/Assistant.tsx
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Utils from 'resource:///com/github/Aylur/ags/utils.js';
import App from 'resource:///com/github/Aylur/ags/app.js'; // Necesario para App.toggleWindow si usas AssistantWindow

// --- ¡¡CONFIGURACIÓN CRÍTICA!! ---
// Reemplaza estas rutas con las rutas ABSOLUTAS correctas en TU sistema.
// 1. Ruta al ejecutable de Python DENTRO de tu entorno virtual.
//    Ejemplo: /home/tu_usuario/ags_pollinations/.venv/bin/python
const venvPythonPath = '/home/snowf/Projects/Pollination/.venv';

// 2. Ruta al script Python que creamos antes.
//    Ejemplo: /home/tu_usuario/ags_pollinations/pollinations_ask.py
const pollinationsScriptPath = '/home/snowf/Projects/Pollination/pollinations_ask.py';
// --- FIN CONFIGURACIÓN ---


/**
 * @description Label para mostrar la salida del asistente.
 */
const AssistantOutputLabel = Widget.Label({
    // Propiedades iniciales
    label: 'Esperando pregunta...',
    className: 'assistant-output', // Para CSS/SCSS
    hexpand: true, // Ocupar todo el ancho horizontal
    vexpand: true, // Ocupar espacio vertical disponible (dentro del Scrollable)
    wrap: true, // Permitir que el texto se divida en múltiples líneas
    xalign: 0, // Alinear texto a la izquierda (0 = izquierda, 0.5 = centro, 1 = derecha)
    justification: 'left', // Justificación del texto
});

/**
 * @description Entrada de texto para escribir el prompt.
 */
const AssistantInputEntry = Widget.Entry({
    // Propiedades iniciales
    placeholder_text: 'Escribe tu prompt aquí...',
    className: 'assistant-input', // Para CSS/SCSS
    hexpand: true, // Ocupar todo el ancho horizontal

    // Acción al presionar Enter
    on_accept: (self) => {
        const prompt = self.text; // Obtener el texto actual

        // Validar que no esté vacío
        if (!prompt || prompt.trim().length === 0) {
            console.warn("Prompt vacío, no se envía la solicitud.");
            return;
        }

        // Limpiar la entrada de texto
        self.text = '';

        // Mostrar mensaje de carga
        AssistantOutputLabel.label = '🤖 Pensando...';

        // Ejecutar el script Python de forma asíncrona
        Utils.execAsync([venvPythonPath, pollinationsScriptPath, prompt])
            .then(output => {
                // Éxito: Mostrar la respuesta del script
                AssistantOutputLabel.label = output.trim(); // .trim() quita espacios al inicio/final
            })
            .catch(err => {
                // Error: Mostrar mensaje de error y loguear en consola
                console.error(`Error al ejecutar script ${pollinationsScriptPath}: ${err}`);
                AssistantOutputLabel.label = `❌ Error al contactar el asistente.\nRevisa la consola de AGS (ejecuta 'ags' en terminal) para más detalles.`;
            });
    },
});


/**
 * @description El Widget principal del Asistente, combinando entrada y salida.
 * Puedes importar y usar ESTE widget directamente si quieres embeberlo en otro lugar
 * (como un panel lateral).
 */
export const AssistantWidget = () => Widget.Box({
    // Propiedades del Box contenedor
    className: 'assistant-widget', // Para CSS/SCSS
    vertical: true, // Apilar elementos verticalmente
    spacing: 8, // Espacio entre la salida y la entrada

    // Elementos hijos
    children: [
        // Hacer la etiqueta de salida desplazable si el contenido es muy largo
        Widget.Scrollable({
            hscroll: 'never', // No permitir scroll horizontal
            vscroll: 'automatic', // Permitir scroll vertical si es necesario
            child: AssistantOutputLabel, // El widget a hacer desplazable
            min_content_height: 100, // Altura mínima antes de que aparezca el scroll
            vexpand: true, // Permitir que esta área crezca verticalmente
        }),

        // La entrada de texto va debajo
        AssistantInputEntry,
    ],
});


/**
 * @description Una Ventana flotante que contiene el AssistantWidget.
 * Útil para mostrar/ocultar el asistente con un botón o atajo de teclado.
 * Necesitas añadir esta ventana a tu lista `windows` en `app.ts`
 * y usar `App.toggleWindow('assistant-window')` para controlarla.
 */
export const AssistantWindow = () => Widget.Window({
    // Propiedades de la Ventana
    name: 'assistant-window', // Nombre único para referenciarla (ej. con App.toggleWindow)
    title: 'Asistente Pollinations', // Título (puede no ser visible dependiendo del WM)
    className: 'assistant-window', // Para CSS/SCSS (para estilizar la ventana en sí)

    // Comportamiento
    //popup: true, // Si quieres que se cierre al hacer clic fuera (comportamiento de popup)
    //focusable: true, // Permitir que la ventana y su contenido reciban foco

    // Posición y Tamaño (Ajusta a tu gusto)
    anchor: ['top'], // Anclar al borde superior de la pantalla
    margins: [10, 10], // Márgenes (ej. [top, right, bottom, left] o [vertical, horizontal])
    // Puedes definir un tamaño fijo o mínimo/máximo si lo deseas:
    // widthRequest: 450,
    // heightRequest: 350,

    // Contenido de la ventana
    child: Widget.Box({ // Añadimos un Box para poder poner padding alrededor del AssistantWidget
        className: 'assistant-window-content', // Clase para estilizar este Box
        child: AssistantWidget(), // El widget que hicimos antes
        css: 'padding: 5px;', // Ejemplo de padding inline (mejor hacerlo en SCSS)
    }),

});

// Exportación por defecto (opcional, pero útil si solo usas el widget embebido)
export default AssistantWidget;