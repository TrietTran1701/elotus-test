import { InputHTMLAttributes, forwardRef } from 'react'
import styles from './Input.module.scss'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className = '', ...props }, ref) => {
    const wrapperClassNames = [
      styles.input__wrapper,
      fullWidth ? styles['input__wrapper--full-width'] : '',
    ]
      .filter(Boolean)
      .join(' ')

    const inputClassNames = [styles.input, error ? styles['input--error'] : '', className]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={wrapperClassNames}>
        {label && (
          <label className={styles.input__label} htmlFor={props.id}>
            {label}
          </label>
        )}
        <input ref={ref} className={inputClassNames} {...props} />
        {error && <span className={styles.input__error}>{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
