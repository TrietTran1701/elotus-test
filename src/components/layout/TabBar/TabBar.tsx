import { MOVIE_CATEGORIES } from '@/constants/app.constants'
import type { MovieCategory } from '@/types'
import styles from './TabBar.module.scss'

export interface TabBarProps {
  activeTab: MovieCategory
  onTabChange: (tab: MovieCategory) => void
}

export const TabBar = ({ activeTab, onTabChange }: TabBarProps) => {
  return (
    <div className={styles.tabbar}>
      <div className={styles.tabbar__tabs}>
        {MOVIE_CATEGORIES.map((category) => {
          const isActive = activeTab === category.value
          const tabClassNames = [
            styles.tabbar__tab,
            isActive ? styles['tabbar__tab--active'] : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              key={category.id}
              className={tabClassNames}
              onClick={() => onTabChange(category.value)}
              aria-pressed={isActive}
            >
              {category.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

