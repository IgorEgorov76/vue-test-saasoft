<template>
  <div class="app">
    <h1>Учетные записи</h1>
    <p class="hint">Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;</p>
    <AccountsTable />
  </div>
</template>

<script lang="ts" setup>
import AccountsTable from './components/AccountsTable.vue'
</script>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.hint {
  color: #909399;
  font-size: 14px;
  margin: 10px 0 20px;
}
</style>
