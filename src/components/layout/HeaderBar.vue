<template>
  <header class="header">
    <div class="search-bar">
      <i class="fas fa-search"></i>
      <input type="text" placeholder="Buscar...">
    </div>
    <div class="user-profile">
      <img src="https://via.placeholder.com/40" alt="Usuario">
      <span>Administrador</span>
    </div>
  </header>
</template>

<script setup lang="ts">
// Component logic here
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: var(--background-color);
  padding: 8px 15px;
  border-radius: 20px;
  width: 300px;
}

.search-bar i {
  color: #666;
  margin-right: 10px;
}

.search-bar input {
  border: none;
  background: none;
  outline: none;
  width: 100%;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-profile img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.user-profile span {
  font-weight: 500;
  color: var(--primary-color);
}
</style> 