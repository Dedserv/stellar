<template>
  <div class="loader-overlay">
    <div class="custom-loader"></div>
  </div>
</template>

<script setup></script>

<style>
  .loader-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    z-index: 9999;
    display: grid;
    place-items: center;
  }

  .custom-loader {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
