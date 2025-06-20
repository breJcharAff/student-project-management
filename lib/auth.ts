// Authentication utilities

export interface User {
    id: number
    email: string
    name: string
    role: string
}

export interface AuthData {
    token: string
    user: User
}

export class AuthManager {
    private static readonly USER_KEY = "currentUser"
    private static readonly TOKEN_KEY = "authToken"

    static login(authData: AuthData): void {
        if (typeof window !== "undefined") {
            localStorage.setItem(this.USER_KEY, JSON.stringify(authData.user))
            localStorage.setItem(this.TOKEN_KEY, authData.token)

            // Trigger a storage event to notify other components
            window.dispatchEvent(new Event("auth-change"))
        }
    }

    static logout(): void {
        if (typeof window !== "undefined") {
            localStorage.removeItem(this.USER_KEY)
            localStorage.removeItem(this.TOKEN_KEY)

            // Trigger a storage event to notify other components
            window.dispatchEvent(new Event("auth-change"))
        }
    }

    static getUser(): User | null {
        if (typeof window !== "undefined") {
            const userData = localStorage.getItem(this.USER_KEY)
            if (userData) {
                try {
                    return JSON.parse(userData)
                } catch (error) {
                    console.error("Error parsing user data:", error)
                    this.logout()
                }
            }
        }
        return null
    }

    static getToken(): string | null {
        if (typeof window !== "undefined") {
            return localStorage.getItem(this.TOKEN_KEY)
        }
        return null
    }

    static isAuthenticated(): boolean {
        const user = this.getUser()
        const token = this.getToken()
        return user !== null && token !== null && !this.isTokenExpired()
    }

    static isTokenExpired(): boolean {
        const token = this.getToken()
        if (!token) return true

        try {
            // Decode JWT token to check expiration
            const payload = JSON.parse(atob(token.split(".")[1]))
            const currentTime = Date.now() / 1000
            // Add a 30 second buffer to prevent edge cases
            return payload.exp < currentTime + 30
        } catch (error) {
            console.error("Error decoding token:", error)
            return true
        }
    }

    static requireAuth(): User | null {
        if (!this.isAuthenticated()) {
            this.logout()
            return null
        }
        return this.getUser()
    }
}
