<template>
  <div class="stat-card">
    <h3 class="stat-title">{{ title }}</h3>
    <p class="stat-value">{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: number
}>()
</script>

<style scoped>
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-title {
  color: var(--text-color);
  font-size: 1rem;
  margin-bottom: 0.5rem;
  opacity: 0.8;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin: 0;
}
</style> 