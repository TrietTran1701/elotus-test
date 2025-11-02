import { useNavigate } from 'react-router-dom'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/common'
import { ROUTES } from '@/constants/routes.constants'
import styles from './NotFoundPage.module.scss'

export const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.page__content}>
          <h1 className={styles.page__title}>404</h1>
          <p className={styles.page__message}>Page Not Found</p>
          <p className={styles.page__description}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className={styles.page__actions}>
            <Button onClick={() => navigate(ROUTES.HOME)} variant="primary" size="large">
              Back to home
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}
