// Puerto de aplicación · Documentos (fichas PDF e imágenes del panel admin).
//
// El panel no sabe dónde acaban los ficheros (nube, inline…): solo pide una URL
// utilizable que luego guarda dentro del producto.

/**
 * Puerto del almacén de documentos.
 * @typedef {object} DocumentStorage
 * @property {(file: File) => Promise<string>} uploadDocument - devuelve la URL pública del fichero
 */
