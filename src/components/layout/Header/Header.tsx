import { Container } from '../Container'
import { APP_CONFIG } from '@/constants/app.constants'
import styles from './Header.module.scss'

export const Header = () => {
  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.header__content}>
          <h1 className={styles.header__logo}>
            <span className={styles.header__logo__icon}>🎬</span>
            {APP_CONFIG.TITLE}
          </h1>
        </div>
      </Container>
    </header>
  )
}

