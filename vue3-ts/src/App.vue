<script setup lang="ts"></script>

<template>
  <div>
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<style scoped>
nav {
  margin-bottom: 20px;
}

nav a {
  margin-right: 10px;
  text-decoration: none;
  color: #333;
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

nav a:hover {
  background-color: #f0f0f0;
}
</style>
