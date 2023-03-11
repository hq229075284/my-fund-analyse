<template>
  <aside class="side-nav">
    <el-menu>
      <el-menu-item index="/fundList">
        基金列表
      </el-menu-item>
      <el-menu-item index="/intelligentFund">
        智能选基
      </el-menu-item>
    </el-menu>
  </aside>
</template>

<style lang="less" scoped>
.side-nav{
  flex:0 0 2px;
  .el-menu{
    height:100%;
  }
}
</style>
