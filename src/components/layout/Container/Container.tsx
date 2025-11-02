import { HTMLAttributes, ReactNode } from 'react'
import styles from './Container.module.scss'

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  size?: 'default' | 'fluid' | 'narrow'
}

export const Container = ({
  children,
  size = 'default',
  className = '',
  ...props
}: ContainerProps) => {
  const classNames = [styles.container, styles[`container--${size}`], className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  )
}
