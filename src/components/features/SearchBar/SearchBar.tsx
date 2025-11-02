import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/common'
import styles from './SearchBar.module.scss'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
  autoFocus?: boolean
}

export const SearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search movies...',
  autoFocus = false,
}: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleClear = () => {
    onClear()
    inputRef.current?.focus()
  }

  return (
    <div className={styles.searchbar}>
      <div
        className={`${styles.searchbar__wrapper} ${
          isFocused ? styles['searchbar__wrapper--focused'] : ''
        }`}
      >
        <svg
          className={styles.searchbar__icon}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          fullWidth
          className={styles.searchbar__input}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.searchbar__clear}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

