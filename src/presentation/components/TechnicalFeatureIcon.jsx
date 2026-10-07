function Symbol({ children }) {
  return <svg className="technical-feature-icon" viewBox="0 0 80 80" fill="none" aria-hidden="true">{children}</svg>
}

export default function TechnicalFeatureIcon({ technicalKey }) {
  if (technicalKey === 'length') return <Symbol><path d="M14 31h52M14 31l7-6M14 31l7 6M66 31l-7-6M66 31l-7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></Symbol>
  if (technicalKey === 'dimensions') return <Symbol><rect x="22" y="17" width="36" height="29" stroke="currentColor" strokeWidth="1.7" /><path d="M18 14v35M62 14v35M18 12h44M15 17h5M15 46h5M60 17h5M60 46h5" stroke="currentColor" strokeWidth="1" /></Symbol>
  if (technicalKey === 'material') return <Symbol><text x="40" y="48" textAnchor="middle" fontFamily="Arial,Helvetica,sans-serif" fontSize="27" fontWeight="700" fill="currentColor">AL</text></Symbol>
  if (technicalKey === 'mountingSurface') return <Symbol><path d="M13 20h54" stroke="currentColor" strokeWidth="2" /><rect x="25" y="25" width="30" height="12" stroke="currentColor" strokeWidth="1.8" /><path d="M25 22v3M55 22v3" stroke="currentColor" strokeWidth="1.4" /></Symbol>
  if (technicalKey === 'mountingSuspended') return <Symbol><path d="M13 17h54M28 18v22M52 18v22" stroke="currentColor" strokeWidth="1.5" /><rect x="23" y="40" width="34" height="11" stroke="currentColor" strokeWidth="1.8" /></Symbol>
  if (technicalKey === 'diffuser') return <Symbol><path d="M18 25h44v11H18z" stroke="currentColor" strokeWidth="1.5" /><path d="M23 41v8M32 41v11M40 41v13M48 41v11M57 41v8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></Symbol>
  return null
}
