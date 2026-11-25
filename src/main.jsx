import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './presentation/styles/index.css'
import './presentation/styles/projects-audit.css'
import './presentation/styles/seo-admin.css'
import './presentation/styles/analytics-admin.css'
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
import { QuoteProvider } from './application/quote/QuoteContext.jsx'
import { createGoogleAnalytics } from './infrastructure/analytics/googleAnalytics.js'

configureLogger(firestoreLogger)

const telemetry = createTelemetry({
  usageRepository: firestoreUsageRepository,
  mailer: webformsMailer,
  contactDirectory: localContactDirectory,
})
const analytics = createGoogleAnalytics()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider authService={firebaseAuthService}>
      <ProductsProvider repository={firestoreProductRepository} telemetry={telemetry}>
        <CategoriesProvider repository={firestoreCategoryRepository} telemetry={telemetry}>
          <SiteSettingsProvider repository={firestoreSettingsRepository}>
              <QuoteProvider>
                <App
                  backendEnabled={isFirebaseConfigured}
                   telemetry={telemetry}
                   analytics={analytics}
                  documentStorage={cloudinaryDocumentStorage}
                  quoteSender={webformsQuoteSender}
                />
              </QuoteProvider>
          </SiteSettingsProvider>
        </CategoriesProvider>
      </ProductsProvider>
    </AuthProvider>
  </StrictMode>,
)
