<template>
 <router-view />
 <router-view name="notFound" />
</template>

<script>
import { useStore } from "vuex";
import { onMounted } from "vue";

export default {
  setup() {
    const store = useStore();
    onMounted(() => store.dispatch("user/checkSession"));
    onMounted(() => store.dispatch("user/setUsers"));
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/reset";
</style>