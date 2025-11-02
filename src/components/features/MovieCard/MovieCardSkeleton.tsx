import styles from './MovieCardSkeleton.module.scss'

export const MovieCardSkeleton = () => {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeleton__poster} />
      <div className={styles.skeleton__content}>
        <div className={styles.skeleton__title} />
        <div className={styles.skeleton__year} />
      </div>
    </div>
  )
}

