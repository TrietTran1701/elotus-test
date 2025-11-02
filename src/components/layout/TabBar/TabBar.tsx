import { MovieCategory } from '@/types'
import styles from './TabBar.module.scss'

export interface TabBarProps {
  activeTab: MovieCategory
  onTabChange: (category: MovieCategory) => void
}

export const TabBar = ({ activeTab, onTabChange }: TabBarProps) => {
  const tabs = [
    { id: MovieCategory.NOW_PLAYING, label: 'Now playing' },
    { id: MovieCategory.TOP_RATED, label: 'Top rated' },
  ]

  return (
    <div className={styles.tabBar}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tabBar__tab} ${
            activeTab === tab.id ? styles['tabBar__tab--active'] : ''
          }`}
          onClick={() => onTabChange(tab.id)}
          aria-selected={activeTab === tab.id}
          role="tab"
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

