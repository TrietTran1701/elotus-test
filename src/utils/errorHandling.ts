import type { ErrorState } from '@/types'

export const createErrorState = (error: unknown): ErrorState => {
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error,
    }
  }

  if (typeof error === 'string') {
    return {
      message: error,
    }
  }

  return {
    message: 'An unknown error occurred',
    details: error,
  }
}

export const logError = (error: unknown, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error)
  }

  // In production, you might want to send errors to a logging service
  // Example: Sentry, LogRocket, etc.
}

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes('Network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout')
    )
  }
  return false
}

