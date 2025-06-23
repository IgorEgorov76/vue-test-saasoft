import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Label {
  text: string
}

interface Account {
  id: string
  labels?: Label[]
  type: 'LDAP' | 'Локальная'
  login: string
  password: string | null
}

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>(JSON.parse(localStorage.getItem('accounts') || '[]'))

  function addAccount() {
    accounts.value.push({
      id: Date.now().toString(),
      labels: [],
      type: 'Локальная',
      login: '',
      password: ''
    })
    saveToLocalStorage()
  }

  function updateAccount(id: string, updatedAccount: Partial<Account>) {
    const index = accounts.value.findIndex(acc => acc.id === id)
    if (index !== -1) {
      accounts.value[index] = { ...accounts.value[index], ...updatedAccount }
      saveToLocalStorage()
    }
  }

  function removeAccount(id: string) {
    accounts.value = accounts.value.filter(acc => acc.id !== id)
    saveToLocalStorage()
  }

  function saveToLocalStorage() {
    localStorage.setItem('accounts', JSON.stringify(accounts.value))
  }

  return { accounts, addAccount, updateAccount, removeAccount }
})
