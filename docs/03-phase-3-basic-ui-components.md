# Phase 3: Basic UI Components & Layout

**Duration**: 6-7 hours  
**Difficulty**: Medium  
**Prerequisites**: Phase 1 & 2 completed

## Overview

This phase focuses on building reusable UI components and establishing the layout structure. We'll create a component library following atomic design principles.

## Objectives

- [ ] Set up global styles and theme
- [ ] Create common UI components (Button, Input, Card, etc.)
- [ ] Build layout components (Header, Footer, Container)
- [ ] Implement loading states
- [ ] Create error message component
- [ ] Implement responsive design
- [ ] Add animations and transitions

## Step-by-Step Instructions

### Step 1: Complete Global Styles Setup

Update `src/styles/base/_typography.scss`:

```scss
@use '../abstracts/variables' as *;

body {
  font-family: $font-family-base;
  font-size: $font-size-md;
  line-height: 1.6;
  color: $text-primary;
  background-color: $background-color;
}

h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-weight: 600;
  line-height: 1.2;
}

h1 {
  font-size: $font-size-2xl;
}

h2 {
  font-size: $font-size-xl;
}

h3 {
  font-size: $font-size-lg;
}

h4 {
  font-size: $font-size-md;
}

p {
  margin: 0;
}

strong {
  font-weight: 600;
}
```

Create `src/styles/base/_animations.scss`:

```scss
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Animation utility classes
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

.fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}

.slide-in-right {
  animation: slideInRight 0.3s ease-out;
}
```

Create `src/styles/layout/_grid.scss`:

```scss
@use '../abstracts/variables' as *;
@use '../abstracts/mixins' as *;

.grid {
  display: grid;
  gap: $spacing-md;
  
  &--cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  &--cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }
  
  &--cols-4 {
    grid-template-columns: repeat(4, 1fr);
  }
  
  &--cols-5 {
    grid-template-columns: repeat(5, 1fr);
  }
  
  &--cols-6 {
    grid-template-columns: repeat(6, 1fr);
  }
  
  // Responsive grid
  &--responsive {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

// Mobile-first responsive grid
.responsive-grid {
  display: grid;
  gap: $spacing-md;
  grid-template-columns: repeat(2, 1fr);
  
  @include respond-to(tablet) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @include respond-to(desktop) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  @include respond-to(desktop-lg) {
    grid-template-columns: repeat(5, 1fr);
  }
  
  @include respond-to(desktop-xl) {
    grid-template-columns: repeat(6, 1fr);
  }
}
```

Create `src/styles/layout/_container.scss`:

```scss
@use '../abstracts/variables' as *;
@use '../abstracts/mixins' as *;

.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 $spacing-md;
  
  @include respond-to(tablet) {
    padding: 0 $spacing-lg;
  }
  
  @include respond-to(desktop) {
    max-width: 1280px;
    padding: 0 $spacing-xl;
  }
  
  @include respond-to(desktop-lg) {
    max-width: 1440px;
  }
  
  @include respond-to(desktop-xl) {
    max-width: 1920px;
  }
  
  &--fluid {
    max-width: 100%;
  }
  
  &--narrow {
    @include respond-to(desktop) {
      max-width: 960px;
    }
  }
}
```

Create `src/styles/main.scss`:

```scss
// Abstracts
@use 'abstracts/variables';
@use 'abstracts/mixins';
@use 'abstracts/functions';
@use 'abstracts/breakpoints';

// Base
@use 'base/reset';
@use 'base/typography';
@use 'base/animations';

// Layout
@use 'layout/grid';
@use 'layout/container';
```

### Step 2: Create Button Component

Create `src/components/common/Button/Button.tsx`:

```typescript
import { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.scss'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  loading?: boolean
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) => {
  const classNames = [
    styles.button,
    styles[`button--${variant}`],
    styles[`button--${size}`],
    fullWidth ? styles['button--full-width'] : '',
    loading ? styles['button--loading'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classNames} disabled={disabled || loading} {...props}>
      {loading && <span className={styles.button__spinner} />}
      <span className={styles.button__content}>{children}</span>
    </button>
  )
}
```

Create `src/components/common/Button/Button.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  border: none;
  border-radius: $border-radius-md;
  font-weight: 500;
  cursor: pointer;
  transition: all $transition-fast;
  font-family: inherit;
  
  @include focus-visible;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  // Variants
  &--primary {
    background-color: $primary-color;
    color: $text-primary;
    
    &:hover:not(:disabled) {
      background-color: darken($primary-color, 10%);
    }
  }
  
  &--secondary {
    background-color: $surface-color;
    color: $text-primary;
    
    &:hover:not(:disabled) {
      background-color: lighten($surface-color, 5%);
    }
  }
  
  &--ghost {
    background-color: transparent;
    color: $text-primary;
    
    &:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
  
  // Sizes
  &--small {
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-sm;
  }
  
  &--medium {
    padding: $spacing-md $spacing-lg;
    font-size: $font-size-md;
  }
  
  &--large {
    padding: $spacing-md $spacing-xl;
    font-size: $font-size-lg;
  }
  
  // Modifiers
  &--full-width {
    width: 100%;
  }
  
  &--loading {
    pointer-events: none;
    
    .button__content {
      opacity: 0.5;
    }
  }
  
  &__spinner {
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  
  &__content {
    transition: opacity $transition-fast;
  }
}
```

Create `src/components/common/Button/index.ts`:

```typescript
export { Button } from './Button'
export type { ButtonProps } from './Button'
```

### Step 3: Create Input Component

Create `src/components/common/Input/Input.tsx`:

```typescript
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

    const inputClassNames = [
      styles.input,
      error ? styles['input--error'] : '',
      className,
    ]
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
```

Create `src/components/common/Input/Input.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.input {
  width: 100%;
  padding: $spacing-md;
  background-color: $surface-color;
  color: $text-primary;
  border: 1px solid transparent;
  border-radius: $border-radius-md;
  font-family: inherit;
  font-size: $font-size-md;
  transition: all $transition-fast;
  
  @include focus-visible;
  
  &::placeholder {
    color: $text-secondary;
  }
  
  &:hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  &:focus {
    border-color: $primary-color;
    background-color: lighten($surface-color, 3%);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  &--error {
    border-color: $error-color;
  }
  
  &__wrapper {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    
    &--full-width {
      width: 100%;
    }
  }
  
  &__label {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $text-secondary;
  }
  
  &__error {
    font-size: $font-size-xs;
    color: $error-color;
  }
}
```

Create `src/components/common/Input/index.ts`:

```typescript
export { Input } from './Input'
export type { InputProps } from './Input'
```

### Step 4: Create Card Component

Create `src/components/common/Card/Card.tsx`:

```typescript
import { HTMLAttributes, ReactNode } from 'react'
import styles from './Card.module.scss'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'small' | 'medium' | 'large'
  hoverable?: boolean
}

export const Card = ({
  children,
  variant = 'default',
  padding = 'medium',
  hoverable = false,
  className = '',
  ...props
}: CardProps) => {
  const classNames = [
    styles.card,
    styles[`card--${variant}`],
    styles[`card--padding-${padding}`],
    hoverable ? styles['card--hoverable'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  )
}
```

Create `src/components/common/Card/Card.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.card {
  background-color: $surface-color;
  border-radius: $border-radius-lg;
  transition: all $transition-base;
  
  &--default {
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  &--elevated {
    box-shadow: $shadow-lg;
  }
  
  &--outlined {
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  &--hoverable {
    cursor: pointer;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: $shadow-xl;
      border-color: rgba(255, 255, 255, 0.15);
    }
  }
  
  &--padding {
    &-none {
      padding: 0;
    }
    
    &-small {
      padding: $spacing-md;
    }
    
    &-medium {
      padding: $spacing-lg;
    }
    
    &-large {
      padding: $spacing-xl;
    }
  }
}
```

Create `src/components/common/Card/index.ts`:

```typescript
export { Card } from './Card'
export type { CardProps } from './Card'
```

### Step 5: Create Loader Component

Create `src/components/common/Loader/Loader.tsx`:

```typescript
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
```

Create `src/components/common/Loader/Loader.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.loader {
  &__container {
    @include flex-center;
    @include flex-column;
    gap: $spacing-md;
    padding: $spacing-xl;
    
    &--fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba($background-color, 0.9);
      z-index: $z-index-modal;
    }
  }
  
  &__spinner {
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: $primary-color;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    
    &--small {
      width: 24px;
      height: 24px;
      border-width: 2px;
    }
    
    &--medium {
      width: 40px;
      height: 40px;
      border-width: 3px;
    }
    
    &--large {
      width: 60px;
      height: 60px;
      border-width: 4px;
    }
  }
  
  &__message {
    color: $text-secondary;
    font-size: $font-size-sm;
  }
}
```

Create `src/components/common/Loader/index.ts`:

```typescript
export { Loader } from './Loader'
export type { LoaderProps } from './Loader'
```

### Step 6: Create ErrorMessage Component

Create `src/components/common/ErrorMessage/ErrorMessage.tsx`:

```typescript
import { Button } from '../Button'
import styles from './ErrorMessage.module.scss'

export interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  fullScreen?: boolean
}

export const ErrorMessage = ({
  message,
  onRetry,
  fullScreen = false,
}: ErrorMessageProps) => {
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
```

Create `src/components/common/ErrorMessage/ErrorMessage.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.error {
  &__container {
    @include flex-center;
    @include flex-column;
    gap: $spacing-md;
    padding: $spacing-xl;
    text-align: center;
    
    &--fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: $background-color;
      z-index: $z-index-modal;
    }
  }
  
  &__icon {
    font-size: 48px;
  }
  
  &__message {
    color: $text-secondary;
    font-size: $font-size-md;
    max-width: 400px;
  }
}
```

Create `src/components/common/ErrorMessage/index.ts`:

```typescript
export { ErrorMessage } from './ErrorMessage'
export type { ErrorMessageProps } from './ErrorMessage'
```

### Step 7: Create LazyImage Component

Create `src/components/common/Image/LazyImage.tsx`:

```typescript
import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react'
import styles from './LazyImage.module.scss'

export interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | null
  alt: string
  placeholderSrc?: string
  aspectRatio?: string
}

export const LazyImage = ({
  src,
  alt,
  placeholderSrc,
  aspectRatio = '2/3',
  className = '',
  ...props
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [currentSrc, setCurrentSrc] = useState<string | null>(placeholderSrc || null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px',
      }
    )

    observer.observe(imgRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!isInView || !src) return

    const img = new Image()
    img.src = src
    
    img.onload = () => {
      setCurrentSrc(src)
      setIsLoaded(true)
    }
    
    img.onerror = () => {
      setIsLoaded(true)
    }
  }, [isInView, src])

  const imageClassNames = [
    styles.image,
    isLoaded ? styles['image--loaded'] : styles['image--loading'],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.image__container} style={{ aspectRatio }}>
      {currentSrc ? (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          className={imageClassNames}
          {...props}
        />
      ) : (
        <div className={styles.image__placeholder} ref={imgRef}>
          <span>🎬</span>
        </div>
      )}
    </div>
  )
}
```

Create `src/components/common/Image/LazyImage.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.image {
  &__container {
    position: relative;
    width: 100%;
    overflow: hidden;
    background-color: $surface-color;
    border-radius: $border-radius-md;
  }
  
  &__placeholder {
    @include flex-center;
    @include absolute-center;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      $surface-color 0%,
      lighten($surface-color, 5%) 50%,
      $surface-color 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    
    span {
      font-size: 48px;
      opacity: 0.3;
    }
  }
}

.image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity $transition-slow;
  
  &--loading {
    opacity: 0;
  }
  
  &--loaded {
    opacity: 1;
    animation: fadeIn $transition-slow;
  }
}
```

Create `src/components/common/Image/index.ts`:

```typescript
export { LazyImage } from './LazyImage'
export type { LazyImageProps } from './LazyImage'
```

### Step 8: Create Layout Components - Container

Create `src/components/layout/Container/Container.tsx`:

```typescript
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
```

Create `src/components/layout/Container/Container.module.scss`:

```scss
@use '@/styles/abstracts/variables' as *;
@use '@/styles/abstracts/mixins' as *;

.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 $spacing-md;
  
  @include respond-to(tablet) {
    padding: 0 $spacing-lg;
  }
  
  &--default {
    @include respond-to(desktop) {
      max-width: 1280px;
      padding: 0 $spacing-xl;
    }
    
    @include respond-to(desktop-lg) {
      max-width: 1440px;
    }
  }
  
  &--fluid {
    max-width: 100%;
  }
  
  &--narrow {
    @include respond-to(desktop) {
      max-width: 960px;
    }
  }
}
```

Create `src/components/layout/Container/index.ts`:

```typescript
export { Container } from './Container'
export type { ContainerProps } from './Container'
```

### Step 9: Create Common Components Index

Create `src/components/common/index.ts`:

```typescript
export { Button } from './Button'
export type { ButtonProps } from './Button'

export { Input } from './Input'
export type { InputProps } from './Input'

export { Card } from './Card'
export type { CardProps } from './Card'

export { Loader } from './Loader'
export type { LoaderProps } from './Loader'

export { ErrorMessage } from './ErrorMessage'
export type { ErrorMessageProps } from './ErrorMessage'

export { LazyImage } from './Image'
export type { LazyImageProps } from './Image'
```

### Step 10: Update Main App Styles

Update `src/main.tsx`:

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/main.scss'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

Update `src/App.tsx` to test components:

```typescript
import { Button, Input, Card, Loader, ErrorMessage, LazyImage } from './components/common'
import { Container } from './components/layout/Container'

function App() {
  return (
    <Container>
      <div style={{ padding: '2rem 0' }}>
        <h1>Component Library Test</h1>
        
        <section style={{ marginTop: '2rem' }}>
          <h2>Buttons</h2>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button loading>Loading</Button>
          </div>
        </section>
        
        <section style={{ marginTop: '2rem' }}>
          <h2>Input</h2>
          <div style={{ maxWidth: '400px', marginTop: '1rem' }}>
            <Input label="Email" placeholder="Enter your email" />
            <Input label="Password" type="password" error="Password is required" />
          </div>
        </section>
        
        <section style={{ marginTop: '2rem' }}>
          <h2>Cards</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
            <Card variant="default">Default Card</Card>
            <Card variant="elevated">Elevated Card</Card>
            <Card variant="outlined" hoverable>Hoverable Card</Card>
          </div>
        </section>
        
        <section style={{ marginTop: '2rem' }}>
          <h2>Loader</h2>
          <Loader message="Loading..." />
        </section>
        
        <section style={{ marginTop: '2rem' }}>
          <h2>Error Message</h2>
          <ErrorMessage 
            message="Something went wrong!" 
            onRetry={() => console.log('Retry clicked')} 
          />
        </section>
      </div>
    </Container>
  )
}

export default App
```

## Verification Checklist

- [ ] All components render without errors
- [ ] Buttons work with different variants
- [ ] Input fields accept text
- [ ] Cards have proper hover effects
- [ ] Loader animates correctly
- [ ] Error message displays properly
- [ ] LazyImage loads images
- [ ] Responsive design works on mobile
- [ ] Animations are smooth
- [ ] TypeScript types are correct

## Common Issues & Solutions

### Issue 1: SCSS Imports Not Working
**Solution**: Verify `vite.config.ts` has correct SCSS configuration and restart dev server.

### Issue 2: Components Not Styled
**Solution**: Ensure CSS modules are enabled and `.module.scss` files are used.

### Issue 3: Animations Not Working
**Solution**: Check that animations.scss is imported in main.scss.

## Next Steps

Proceed to **Phase 4: Feature Implementation - Movie Lists** where we'll:
- Create MovieCard component
- Build MovieList and MovieGrid components
- Implement tab navigation
- Connect to API services

## Resources

- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [SCSS Best Practices](https://sass-guidelin.es/)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

