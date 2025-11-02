import styles from './ViewModeToggle.module.scss'

export type ViewMode = 'grid' | 'list'

export interface ViewModeToggleProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
  className?: string
}

export const ViewModeToggle = ({
  value,
  onChange,
  className = '',
}: ViewModeToggleProps) => {
  return (
    <div className={`${styles.toggle} ${className}`} role="tablist" aria-label="View mode">
      <button
        type="button"
        role="tab"
        aria-selected={value === 'grid'}
        aria-controls="grid-view"
        className={`${styles.toggle__button} ${
          value === 'grid' ? styles['toggle__button--active'] : ''
        }`}
        onClick={() => onChange('grid')}
        aria-label="Grid view"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === 'list'}
        aria-controls="list-view"
        className={`${styles.toggle__button} ${
          value === 'list' ? styles['toggle__button--active'] : ''
        }`}
        onClick={() => onChange('list')}
        aria-label="List view"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>
    </div>
  )
}

