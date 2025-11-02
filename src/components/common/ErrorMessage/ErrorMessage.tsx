import { Button } from '../Button'
import styles from './ErrorMessage.module.scss'

export interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  fullScreen?: boolean
}

export const ErrorMessage = ({ message, onRetry, fullScreen = false }: ErrorMessageProps) => {
  const containerClassNames = [
    styles.error__container,
    fullScreen ? styles['error__container--fullscreen'] : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClassNames}>
      <div className={styles.error__icon}>⚠️</div>
      <p className={styles.error__message}>{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          Try Again
        </Button>
      )}
    </div>
  )
}
