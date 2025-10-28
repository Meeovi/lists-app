import { ref, computed } from 'vue'
import { readMe, login, logout } from '@directus/sdk'

export const useDirectusAuth = () => {
  const { $directus } = useNuxtApp()
  const user = ref(null)
  const loading = ref(false)

  const getCurrentUser = async () => {
    try {
      return await $directus.request(readMe())
    } catch (error) {
      return null
    }
  }

  const signOut = async () => {
    try {
      await $directus.request(logout())
      user.value = null
      await navigateTo('/')
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await $directus.request(login(email, password))
      const currentUser = await getCurrentUser()
      user.value = currentUser
      return currentUser
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  const isAuthenticated = computed(() => !!user.value)

  return {
    user,
    loading,
    isAuthenticated,
    signIn,
    signOut,
    getCurrentUser
  }
}