import { API_CONFIG, API_ERRORS } from '@/constants/api.constants'
import type { ApiError, ApiRequestConfig } from '@/types/api.types'

class ApiClient {
  private baseURL: string
  private apiKey: string
  private timeout: number

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.apiKey = API_CONFIG.API_KEY
    this.timeout = API_CONFIG.TIMEOUT

    // Validate configuration
    if (!this.apiKey) {
      throw new Error('TMDB API key is not configured')
    }
  }

  private buildURL(endpoint: string, params?: Record<string, string | number>): string {
    const url = new URL(`${this.baseURL}${endpoint}`)

    // Add API key
    url.searchParams.append('api_key', this.apiKey)

    // Add additional parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    return url.toString()
  }

  private async fetchWithTimeout(url: string, config?: ApiRequestConfig): Promise<Response> {
    const controller = new AbortController()
    const signal = config?.signal || controller.signal

    const timeoutId = setTimeout(() => {
      controller.abort()
    }, this.timeout)

    try {
      const response = await fetch(url, { signal })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(API_ERRORS.TIMEOUT_ERROR)
      }

      throw error
    }
  }

  private handleError(error: unknown): ApiError {
    if (error instanceof Error) {
      // Network errors
      if (error.message === API_ERRORS.TIMEOUT_ERROR) {
        return {
          status_code: 408,
          status_message: API_ERRORS.TIMEOUT_ERROR,
          success: false,
        }
      }

      if (error.message.includes('Failed to fetch')) {
        return {
          status_code: 0,
          status_message: API_ERRORS.NETWORK_ERROR,
          success: false,
        }
      }

      return {
        status_code: 500,
        status_message: error.message || API_ERRORS.UNKNOWN_ERROR,
        success: false,
      }
    }

    return {
      status_code: 500,
      status_message: API_ERRORS.UNKNOWN_ERROR,
      success: false,
    }
  }

  async get<T>(endpoint: string, config?: ApiRequestConfig): Promise<T> {
    try {
      const url = this.buildURL(endpoint, config?.params)
      const response = await this.fetchWithTimeout(url, config)

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = (await response.json()) as ApiError

        let errorMessage: string = API_ERRORS.UNKNOWN_ERROR

        switch (response.status) {
          case 401:
            errorMessage = API_ERRORS.UNAUTHORIZED
            break
          case 404:
            errorMessage = API_ERRORS.NOT_FOUND
            break
          case 429:
            errorMessage = API_ERRORS.RATE_LIMIT
            break
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = API_ERRORS.SERVER_ERROR
            break
          default:
            errorMessage = errorData.status_message || API_ERRORS.UNKNOWN_ERROR
        }

        throw new Error(errorMessage)
      }

      const data = (await response.json()) as T
      return data
    } catch (error) {
      const apiError = this.handleError(error)
      throw new Error(apiError.status_message)
    }
  }

  // Build image URL helper
  getImageURL(path: string | null, size: string = 'original'): string | null {
    if (!path) return null
    return `${API_CONFIG.IMAGE_BASE_URL}/${size}${path}`
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
