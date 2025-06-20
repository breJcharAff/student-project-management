// API utility functions for making authenticated requests
import { AuthManager } from "./auth"

interface ApiResponse<T> {
    data?: T
    error?: string
}

class ApiClient {
    private baseUrl = "/api"

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        try {
            const headers: HeadersInit = {
                "Content-Type": "application/json",
                ...options.headers,
            }

            const token = AuthManager.getToken()
            if (token) {
                headers.Authorization = `Bearer ${token}`
            }

            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers,
            })

            if (!response.ok) {
                // If unauthorized, logout and redirect
                if (response.status === 401) {
                    AuthManager.logout()
                    if (typeof window !== "undefined") {
                        window.location.href = "/login"
                    }
                    return { error: "Authentication required" }
                }

                const errorData = await response.json().catch(() => ({}))
                return { error: errorData.message || `HTTP ${response.status}` }
            }

            const data = await response.json()
            return { data }
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error)
            return { error: "Network error" }
        }
    }

    // Authentication
    async login(email: string, password: string): Promise<ApiResponse<any>> {
        return this.request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        })
    }

    // Projects
    async getProjects(): Promise<ApiResponse<any[]>> {
        return this.request("/projects")
    }

    async getProject(id: string): Promise<ApiResponse<any>> {
        return this.request(`/projects/${id}`)
    }

    async createProject(project: any): Promise<ApiResponse<any>> {
        return this.request("/projects", {
            method: "POST",
            body: JSON.stringify(project),
        })
    }

    // Groups
    async getGroups(): Promise<ApiResponse<any[]>> {
        return this.request("/groups")
    }

    // Evaluations
    async getEvaluations(): Promise<ApiResponse<any[]>> {
        return this.request("/evaluations")
    }
}

export const apiClient = new ApiClient()
