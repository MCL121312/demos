<script setup lang="ts">
defineOptions({
  name: "Layout"
});
</script>

<template>
  <div class="layout">
    <div class="header">header</div>
    <div class="side">side</div>
    <section class="main">
      <router-view></router-view>
    </section>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: 50px 1fr;
  width: 100%;
  height: 100%;
  grid-template-areas:
    "header header"
    "side main";
  .header {
    grid-area: header;
    height: 50px;
    background-color: antiquewhite;
  }
  .side {
    grid-area: side;
    width: 200px;
    height: 100%;
    background-color: #f0f0f0;
  }
  .main {
    grid-area: main;
    height: 100%;
    background-color: #fff;
  }
}
</style>
