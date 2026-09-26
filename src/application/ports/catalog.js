// Puertos de aplicación · Catálogo.
//
// Contratos (puertos driven) que la aplicación necesita del exterior. Los define
// la aplicación; los implementa la infraestructura (p. ej. Firestore). Ningún
// método menciona Firebase, HTTP ni ninguna tecnología: solo conceptos del
// dominio (producto, categoría, ajustes).

/**
 * @typedef {object} Product
 * @property {string} id
 */

/**
 * @typedef {object} Category
 * @property {string} slug
 */

/**
 * @typedef {object} ProductListResult
 * @property {Product[]} items
 * @property {'cloud' | 'cache'} source - de dónde han salido los datos
 */

/**
 * Puerto del repositorio de productos (agregado raíz: producto).
 * @typedef {object} ProductRepository
 * @property {() => boolean} isConfigured
 * @property {() => Promise<ProductListResult>} listProducts
 * @property {(product: Product) => Promise<void>} saveProduct - crea o actualiza por id
 * @property {(id: string) => Promise<void>} deleteProduct
 * @property {() => Promise<void>} clearProducts
 */

/**
 * Puerto del repositorio de categorías (agregado raíz: categoría, id = slug).
 * @typedef {object} CategoryRepository
 * @property {() => boolean} isConfigured
 * @property {() => Promise<ProductListResult>} listCategories
 * @property {(category: Category) => Promise<void>} saveCategory
 * @property {(slug: string) => Promise<void>} deleteCategory
 */

/**
 * Puerto del repositorio de ajustes (documento único).
 * @typedef {object} SettingsRepository
 * @property {() => object} getCachedSync - copia local inmediata (nunca falla)
 * @property {() => Promise<object|null>} loadSettings - parcial remoto o null
 * @property {(settings: object) => Promise<void>} saveSettings
 */
