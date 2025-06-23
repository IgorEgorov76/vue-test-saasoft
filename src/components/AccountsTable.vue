<template>
  <div class="accounts-table">
    <el-button type="primary" @click="addAccount" class="add-btn">+ Добавить учетную запись</el-button>

    <el-table :data="accounts" border>
      <el-table-column prop="labels" label="Метка" width="200">
        <template #default="{ row }">
          <el-input
            v-model="row.labelsInput"
            placeholder="Метки через ;"
            maxlength="50"
            @blur="() => handleLabelsBlur(row)"
            :class="{ 'invalid-field': row.errors.labels }"
          />
        </template>
      </el-table-column>

      <el-table-column prop="type" label="Тип записи" width="150">
        <template #default="{ row }">
          <el-select
            v-model="row.type"
            @change="() => handleTypeChange(row)"
            class="type-select"
          >
            <el-option label="LDAP" value="LDAP" />
            <el-option label="Локальная" value="Локальная" />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column prop="login" label="Логин" width="200">
        <template #default="{ row }">
          <el-input
            v-model="row.login"
            placeholder="Логин"
            maxlength="100"
            @blur="() => validateAndSave(row)"
            :class="{ 'invalid-field': row.errors.login }"
          />
        </template>
      </el-table-column>

      <el-table-column prop="password" label="Пароль" width="200">
        <template #default="{ row }">
          <div class="password-field">
            <el-input
              v-if="row.type === 'Локальная'"
              v-model="row.password"
              :type="row.showPassword ? 'text' : 'password'"
              placeholder="Пароль"
              maxlength="100"
              @blur="() => validateAndSave(row)"
              :class="{ 'invalid-field': row.errors.password }"
            />
            <span v-else>-</span>

            <button
              v-if="row.type === 'Локальная'"
              class="eye-icon"
              @mousedown="row.showPassword = true"
              @mouseup="row.showPassword = false"
              @mouseleave="row.showPassword = false"
            >
              <svg v-if="!row.showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Действия" width="100">
        <template #default="{ $index }">
          <button
            class="delete-btn"
            @click="removeAccount($index)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" y2="17" x2="14"></line>
            </svg>
          </button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAccountsStore } from '../stores/accounts'

const accountsStore = useAccountsStore()

interface TableAccount {
  id: string
  labels?: { text: string }[]
  labelsInput: string
  type: 'LDAP' | 'Локальная'
  login: string
  password: string | null
  showPassword: boolean
  errors: {
    labels: boolean
    login: boolean
    password: boolean
  }
}

const accounts = computed<TableAccount[]>(() => {
  return accountsStore.accounts.map(acc => ({
    ...acc,
    labelsInput: acc.labels?.map(label => label.text).join(';') || '',
    showPassword: false,
    errors: {
      labels: false,
      login: !acc.login.trim(),
      password: acc.type === 'Локальная' && !acc.password
    }
  }))
})

function addAccount() {
  accountsStore.addAccount()
}

function removeAccount(index: number) {
  accountsStore.removeAccount(accounts.value[index].id)
}

function handleLabelsBlur(row: TableAccount) {
  const labels = row.labelsInput
    .split(';')
    .filter(text => text.trim())
    .map(text => ({ text: text.trim() }))

  accountsStore.updateAccount(row.id, { labels })
  validateAndSave(row)
}

function handleTypeChange(row: TableAccount) {
  if (row.type === 'LDAP') {
    accountsStore.updateAccount(row.id, { type: 'LDAP', password: null })
    row.errors.password = false
  } else if (row.type === 'Локальная' && row.password === null) {
    accountsStore.updateAccount(row.id, { type: 'Локальная', password: '' })
  }
  validateAndSave(row)
}

function validateAndSave(row: TableAccount) {
  row.errors.login = !row.login.trim()
  row.errors.password = row.type === 'Локальная' && !row.password

  if (!row.errors.login && !row.errors.password) {
    accountsStore.updateAccount(row.id, {
      login: row.login,
      password: row.password
    })
  }
}
</script>

<style scoped>
.accounts-table {
  padding: 20px;
}

.add-btn {
  margin-bottom: 20px;
}

.invalid-field :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c inset !important;
}

.type-select {
  width: 100%;
}

:deep(.el-table__row) {
  height: auto;
}

.delete-btn {
  border: none;
  cursor: pointer;
  padding: 0;

  svg {
    max-height: 24px;
    width: auto;
    transition: stroke 1s ease;
  }
}

.delete-btn:hover {
  svg {
    stroke: #f56c6c;
    transition: stroke 0.3s ease;
  }
}

:deep(.el-table_1_column_5) {
  .cell {
    display: flex;
  }
}

.password-field {
  position: relative;
  width: 100%;
}

.password-field :deep(.el-input__wrapper) {
  padding-right: 32px;
}

.eye-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  user-select: none;
  color: #909399;
  transition: all 0.3s ease;
  z-index: 2;
  background: transparent;
  border: none;
  outline: none;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  padding: 0;
}

.eye-icon:hover {
  color: #409eff;
  opacity: 1;
}

.eye-icon svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.eye-icon.active {
  color: #409eff;
}

.invalid-field :deep(.el-input__wrapper) {
  padding-right: 32px;
}

.password-field:focus-within .eye-icon {
  color: #409eff;
  opacity: 1;
}
</style>
