import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdminUser } from '@/types'

const TOKEN_KEY = 'aiermei_admin_token'
const USER_KEY = 'aiermei_admin_user'

export const useUserStore = defineStore('user', () => {
  const initialToken = localStorage.getItem(TOKEN_KEY)
  const initialUser = JSON.parse(localStorage.getItem(USER_KEY) || 'null') as AdminUser | null

  // Remove legacy mock credentials to prevent backend integration failures.
  if (initialToken?.startsWith('mock_token_')) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  const token = ref<string | null>(initialToken?.startsWith('mock_token_') ? null : initialToken)
  const user = ref<AdminUser | null>(initialToken?.startsWith('mock_token_') ? null : initialUser)

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem(TOKEN_KEY, newToken)
  }

  function setUser(newUser: AdminUser) {
    user.value = newUser
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
  }

  function login(tokenValue: string, userData: AdminUser) {
    setToken(tokenValue)
    setUser(userData)
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  function hasPermission(permission: string): boolean {
    if (!user.value) return false
    if (user.value.role === 'admin') return true
    return user.value.permissions.includes(permission)
  }

  return {
    token,
    user,
    isLoggedIn,
    isAdmin,
    setToken,
    setUser,
    login,
    logout,
    hasPermission
  }
})
