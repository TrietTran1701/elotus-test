import styles from './Loader.module.scss'

export interface LoaderProps {
  size?: 'small' | 'medium' | 'large'
  fullScreen?: boolean
  message?: string
}

export const Loader = ({ size = 'medium', fullScreen = false, message }: LoaderProps) => {
  const containerClassNames = [
    styles.loader__container,
    fullScreen ? styles['loader__container--fullscreen'] : '',
  ]
    .filter(Boolean)
    .join(' ')

  const spinnerClassNames = [styles.loader__spinner, styles[`loader__spinner--${size}`]]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClassNames}>
      <div className={spinnerClassNames} />
      {message && <p className={styles.loader__message}>{message}</p>}
    </div>
  )
}
