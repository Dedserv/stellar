<template>
  <Teleport to="#teleports">
    <Transition>
      <div class="modal">
        <div class="container">
          <ModalHeader></ModalHeader>
          <div class="question-group">
            <ImgCheckbox value="[woman]" true-value="woman" :false-value="false" @input="input">
              <VCard
                img="/img/zodiacs/sagittarius.webp"
                title="Женский"
                type="textInside"
                rounded
              ></VCard>
            </ImgCheckbox>

            <ImgCheckbox value="[man]" true-value="man" :false-value="false" @input="input">
              <VCard img="/img/zodiacs/leo.webp" title="Мужской" type="textInside" rounded></VCard>
            </ImgCheckbox>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
  import { modalStore } from '@/stores/modal';
  import quastions from '@/assets/js/mockQuastions';

  const modal = modalStore();
  const selectedGenders = ref([]);

  onMounted(() => {});

  const input = (value) => {
    console.log(value);
  };
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 4rem 10rem;
    width: 100%;
    height: 100%;
    background-color: $blackBlue;
    z-index: 9999;
    overflow: hidden;
  }

  .question-group {
    display: flex;
    height: 100%;
    max-width: 48vw;
    margin: auto;
    margin-top: 8rem;
  }
</style>
