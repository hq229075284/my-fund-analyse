<template>
  <div class="fund-list-page">
    <div class="condition">
      <el-form inline>
        <el-form-item label="日增长">
          <el-input placeholder="请输入，例如：>=0" />
        </el-form-item>
        <el-form-item label="近1周">
          <el-input placeholder="请输入，例如：>=0" />
        </el-form-item>
        <el-form-item label="近1月">
          <el-input placeholder="请输入，例如：>=0" />
        </el-form-item>
        <el-form-item label="近3月">
          <el-input placeholder="请输入，例如：>=0" />
        </el-form-item>
        <el-form-item label="近6月">
          <el-input placeholder="请输入，例如：>=0" />
        </el-form-item>
        <el-form-item label="近1年">
          <el-input placeholder="请输入，例如：>=0" />
        </el-form-item>
        <el-form-item label="起购金额">
          <el-input placeholder="请输入，例如：>=0" />
        </el-form-item>
        <el-form-item label="手续费">
          <el-input placeholder="请输入，例如：>=0" />
        </el-form-item>
        <el-button type="primary">
          查询
        </el-button>
      </el-form>
    </div>

    <el-table
      :data="tableData"
      style="width: 100%"
      max-height="calc(100% - 200px)"
    >
      <el-table-column prop="基金名称" label="基金名称" />
      <el-table-column prop="基金编码" label="基金编码" />
      <el-table-column prop="日增长" label="日增长" />
      <el-table-column prop="近1周" label="近1周" />
      <el-table-column prop="近1月" label="近1月" />
      <el-table-column prop="近3月" label="近3月" />
      <el-table-column prop="近6月" label="近6月" />
      <el-table-column prop="近1年" label="近1年" />
      <el-table-column prop="起购金额" label="起购金额" />
      <el-table-column prop="手续费" label="手续费" />
    </el-table>
  </div>
</template>

<script lang="ts" setup>

const tableData = ref([])
</script>

<style lang="less" scoped>
.fund-list-page{
    display: grid;
    grid-template-rows: auto 1fr;
    grid-auto-rows: auto;
    height: 100%;
}
</style>
