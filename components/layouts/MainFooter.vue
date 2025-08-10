<template>
  <footer class="footer">
    <div class="container">
      <nav class="footer__navigation">
        <li><a href="#">Политика конфиденциальности</a></li>
      </nav>
      <span>©2025 Stellar</span>
    </div>
  </footer>
</template>

<style scoped>
  @import '~/assets/css/variables.css';
  .footer {
    background-color: $darkBlack;
    color: $primaryWhite;
    text-align: center;
    padding: 3rem 1.6rem 6rem;
    border-top: 1px solid $blackOrange;
    margin-top: auto;

    &__navigation {
      margin-bottom: 4rem;
    }
  }
</style>
