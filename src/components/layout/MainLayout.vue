<template>
  <div class="main-layout">
    <SideBar />
    <main class="main-content">
      <slot></slot>
    </main>
  </div>
</template>

<script setup lang="ts">
import SideBar from './SideBar.vue'
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  padding: 2rem;
  background-color: var(--background-color);
  min-height: 100vh;
}
</style> 