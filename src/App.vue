<template>
  <div id="app">
    <Sidebar class="sidebar" />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/views/Sidebar.vue';
</script>

<style scoped>
#app {
  display: flex;
  height: 100vh;
  background-color: white;
}

.sidebar {
  width: 12%;
  height: 100vh;
}

.main-content {
  width: 88%;
  height: 100vh;
  overflow: hidden;
  background-color: var(--chat-background-color);
}
</style>