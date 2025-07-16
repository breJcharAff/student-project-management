// API utility functions for making authenticated requests
import { AuthManager } from "./auth"

interface ApiResponse<T> {
  data?: T
  error?: string
}

class ApiClient {
  private baseUrl = ""

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

      const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || `HTTP ${response.status}` }
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return { data: null } // Or { data: {} } depending on desired empty state
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

  async register(email: string, name: string, password: string, role: string): Promise<ApiResponse<any>> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, name, password, role }),
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

  async updateProject(id: string, project: any): Promise<ApiResponse<any>> {
    return this.request(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(project),
    })
  }

  async getPromotions(): Promise<ApiResponse<any[]>> {
    return this.request("/promotions")
  }

  async getPromotion(id: string): Promise<ApiResponse<any>> {
    return this.request(`/promotions/${id}`)
  }

  async getStudentsByPromotion(promotionId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/promotions/${promotionId}/students`)
  }

  async createPromotion(promotionData: { name: string; teacherIds: number[] }): Promise<ApiResponse<any>> {
    return this.request("/promotions", {
      method: "POST",
      body: JSON.stringify(promotionData),
    })
  }

  async addStudentsToPromotion(promotionId: string, studentIds: number[]): Promise<ApiResponse<any>> {
    return this.request(`/promotions/${promotionId}/students`, {
      method: "POST",
      body: JSON.stringify({ studentIds }),
    })
  }

  async getUsers(): Promise<ApiResponse<any[]>> {
    try {
      const token = AuthManager.getToken()
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/users`, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        // Do NOT logout on 401 for getUsers, just return an error
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || `HTTP ${response.status}` }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      console.error(`API request failed: /users`, error)
      return { error: "Network error" }
    }
  }

  async deleteProject(id: string): Promise<ApiResponse<any>> {
    return this.request(`/projects/${id}`, {
      method: "DELETE",
    })
  }

  async deleteDeliverable(id: string): Promise<ApiResponse<any>> {
    return this.request(`/deliverables/${id}`, {
      method: "DELETE",
    })
  }

  async updateEvaluationGrid(id: string, data: { isFinal: boolean }): Promise<ApiResponse<any>> {
    return this.request(`/evaluation-grids/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async finalizeProjectGrades(projectId: string, isFinal: boolean): Promise<ApiResponse<any>> {
    return this.request(`/projects/${projectId}/finalize`, {
      method: "POST",
      body: JSON.stringify({ isFinal }),
    })
  }

  async getProjectSteps(projectId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/projectSteps/projects/${projectId}/steps`)
  }

  // Groups
  async getGroups(): Promise<ApiResponse<any[]>> {
    return this.request("/groups")
  }

  async getGroup(id: string): Promise<ApiResponse<any>> {
    return this.request(`/groups/${id}`)
  }

  async createGroup(groupData: { projectId: number }): Promise<ApiResponse<any>> {
    return this.request("/groups/create", {
      method: "POST",
      body: JSON.stringify(groupData),
    })
  }

  async joinGroup(groupId: string, students: number[]): Promise<ApiResponse<any>> {
    return this.request(`/groups/${groupId}/students`, {
      method: "POST",
      body: JSON.stringify({ students }),
    })
  }

  async leaveGroup(groupId: string, studentIds: number[]): Promise<ApiResponse<any>> {
    return this.request(`/groups/${groupId}/students/remove`, {
      method: "POST",
      body: JSON.stringify({ students: studentIds }),
    })
  }

  // Deliverables
  async uploadDeliverable(stepId: string, formData: FormData): Promise<ApiResponse<any>> {
    const token = AuthManager.getToken()

    const response = await fetch(`/api/deliverables/step/${stepId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData, let the browser set it
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { error: errorData.message || `HTTP ${response.status}` }
    }

    const data = await response.json()
    return { data }
  }

  async downloadDeliverable(deliverableId: string): Promise<Blob | null> {
    try {
      const token = AuthManager.getToken()
      const response = await fetch(`/api/deliverables/${deliverableId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.blob()
    } catch (error) {
      console.error("Download failed:", error)
      return null
    }
  }

  // Evaluations
  async getEvaluations(): Promise<ApiResponse<any[]>> {
    return this.request("/evaluations")
  }

  
}

export const apiClient = new ApiClient()
