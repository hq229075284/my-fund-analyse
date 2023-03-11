<template>
  <div class="side-layout">
    <SideNav />
    <main>
      <slot />
    </main>
  </div>
</template>

<style lang="less" scoped>
.side-layout{
  display: flex;
  width: 100%;
  height: 100%;
}
</style>
