import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './presentation/styles/index.css'
import App from './App.jsx'
import { ProductsProvider } from './application/catalog/ProductsContext.jsx'
import { CategoriesProvider } from './application/catalog/CategoriesContext.jsx'
import { AuthProvider } from './application/identity/AuthContext.jsx'
import { SiteSettingsProvider } from './application/catalog/SiteSettingsContext.jsx'
import { configureLogger } from './application/logging/logger.js'
import { createTelemetry } from './application/telemetry/usage.js'
// Composition root: el único lugar que conoce a la vez la aplicación y la
// infraestructura. Aquí se cablean los puertos con sus adaptadores.
import { isFirebaseConfigured } from './infrastructure/firebase/client.js'
import { firestoreProductRepository } from './infrastructure/catalog/firestoreProductRepository.js'
import { firestoreCategoryRepository } from './infrastructure/catalog/firestoreCategoryRepository.js'
import { firestoreSettingsRepository } from './infrastructure/catalog/firestoreSettingsRepository.js'
import { firebaseAuthService } from './infrastructure/identity/firebaseAuthService.js'
import { firestoreUsageRepository } from './infrastructure/telemetry/firestoreUsageRepository.js'
import { webformsMailer, webformsQuoteSender } from './infrastructure/notifications/webformsClient.js'
import { localContactDirectory } from './infrastructure/browser/localContactDirectory.js'
import { cloudinaryDocumentStorage } from './infrastructure/documents/documentStorage.js'
import { firestoreLogger } from './infrastructure/logging/firestoreLogger.js'

configureLogger(firestoreLogger)

const telemetry = createTelemetry({
  usageRepository: firestoreUsageRepository,
  mailer: webformsMailer,
  contactDirectory: localContactDirectory,
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider authService={firebaseAuthService}>
      <ProductsProvider repository={firestoreProductRepository} telemetry={telemetry}>
        <CategoriesProvider repository={firestoreCategoryRepository} telemetry={telemetry}>
          <SiteSettingsProvider repository={firestoreSettingsRepository}>
            <App
              backendEnabled={isFirebaseConfigured}
              telemetry={telemetry}
              documentStorage={cloudinaryDocumentStorage}
              quoteSender={webformsQuoteSender}
            />
          </SiteSettingsProvider>
        </CategoriesProvider>
      </ProductsProvider>
    </AuthProvider>
  </StrictMode>,
)
