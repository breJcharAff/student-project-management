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
                    const user = JSON.parse(userData)
                    console.log("AuthManager: getUser - User data found:", user)
                    return user
                } catch (error) {
                    console.error("AuthManager: getUser - Error parsing user data:", error)
                    // Do not logout here, let isAuthenticated handle it
                }
            }
        }
        console.log("AuthManager: getUser - No user data found.")
        return null
    }

    static getToken(): string | null {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem(this.TOKEN_KEY)
            console.log("AuthManager: getToken - Token found:", !!token)
            return token
        }
        console.log("AuthManager: getToken - No window object, returning null.")
        return null
    }

    static isAuthenticated(): boolean {
        console.log("AuthManager: isAuthenticated - Checking authentication status...")
        const user = this.getUser()
        const token = this.getToken()
        const tokenExpired = this.isTokenExpired()

        const authenticated = user !== null && token !== null && !tokenExpired
        console.log("AuthManager: isAuthenticated - Result:", { user: !!user, token: !!token, tokenExpired, authenticated })
        return authenticated
    }

    static isTokenExpired(): boolean {
        const token = this.getToken()
        if (!token) {
            console.log("AuthManager: isTokenExpired - No token, considering expired.")
            return true
        }

        try {
            // Decode JWT token to check expiration
            const payload = JSON.parse(atob(token.split(".")[1]))
            const currentTime = Date.now() / 1000
            const expired = payload.exp < currentTime
            console.log("AuthManager: isTokenExpired - Token expiration check:", { payloadExp: payload.exp, currentTime, expired })
            return expired
        } catch (error) {
            console.error("AuthManager: isTokenExpired - Error decoding token:", error)
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
