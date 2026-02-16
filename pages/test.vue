<template>
  <div class="test"></div>
</template>

<script setup>
  const { data } = await useFetch(
    '/api/astro?year=1990&month=5&day=15&hour=14&minute=30&latitude=55.75&longitude=37.62&timezone=3'
  );
  console.log('data', data);
</script>

<style scoped>
  .test {
    color: white;
    margin-top: 10rem;
  }
</style>
