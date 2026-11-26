import type { ReactNode } from 'react'

/** Bottom navigation from the Figma Homepage. The centre slot hosts the sale widget. */
export default function BottomNav({ widget }: { widget: ReactNode }) {
  return (
    <nav className="bnav" aria-label="Primary">
      <div className="bnav-row">
        <div className="bnav-item" style={{ padding: '8px 20px 0 24px' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2.18105 17.9166V8.412L10.0026 1.92706L17.9231 8.412V17.9166H2.18105Z" fill="#D1D4D6" stroke="#161601" strokeWidth="0.8" /></svg>
          <span>HOME</span>
        </div>
        <div className="bnav-item" style={{ padding: '8px 8px 0' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#56595d" strokeWidth="0.83">
            <rect x="1.67" y="1.67" width="7.5" height="7.5" /><rect x="10.83" y="1.67" width="7.5" height="7.5" />
            <rect x="1.67" y="10.83" width="7.5" height="7.5" /><rect x="10.83" y="10.83" width="7.5" height="7.5" />
          </svg>
          <span>CATEGORY</span>
        </div>
        <div className="bnav-slot">{widget}</div>
        <div className="bnav-item" style={{ padding: '8px 24px 0 20px' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect width="13.43" height="10.46" stroke="#56595d" strokeWidth="0.4" transform="matrix(0.1175 0.9931 -0.9931 0.1175 12.24 3.23)" />
            <rect width="15" height="11.72" fill="#fff" stroke="#56595d" strokeWidth="0.4" transform="matrix(0 1 -1 0 17.77 2.95)" />
          </svg>
          <span>SHOP</span>
        </div>
        <div className="bnav-item" style={{ padding: '8px 16px 0 8px' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#56595D" strokeWidth="0.8">
            <path d="M2.10287 13.6979L9.9935 11.9922L17.8971 13.6979V17.8971H2.10287V13.6979Z" />
            <path d="M13.5872 5.64453C13.5872 7.6293 11.9783 9.23828 9.9935 9.23828C8.00873 9.23828 6.39975 7.6293 6.39975 5.64453C6.39975 3.65976 8.00873 2.05078 9.9935 2.05078C11.9783 2.05078 13.5872 3.65976 13.5872 5.64453Z" />
          </svg>
          <span>ACCOUNT</span>
        </div>
      </div>
    </nav>
  )
}
