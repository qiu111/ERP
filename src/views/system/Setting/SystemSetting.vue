<template>
  <div class="system-setting">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      class="setting-form"
    >
      <el-form-item label="站点名称" prop="web_name">
        <el-input v-model="formData.web_name" placeholder="请输入站点名称" />
      </el-form-item>

      <el-form-item label="公司名称" prop="web_company">
        <el-input v-model="formData.web_company" placeholder="请输入公司名称" />
      </el-form-item>

      <el-form-item label="链接地址" prop="web_url">
        <el-input v-model="formData.web_url" placeholder="请输入链接地址" />
      </el-form-item>

      <el-form-item label="服务电话" prop="web_hotline">
        <el-input v-model="formData.web_hotline" placeholder="请输入服务电话" />
      </el-form-item>

      <el-form-item label="版本" prop="web_version">
        <el-input v-model="formData.web_version" placeholder="请输入版本" />
      </el-form-item>

      <el-form-item label="站点简介" prop="web_description">
        <el-input
          v-model="formData.web_description"
          type="textarea"
          :rows="4"
          placeholder="请输入站点简介"
        />
      </el-form-item>

      <el-form-item label="站点关键字" prop="web_keywords">
        <el-input
          v-model="formData.web_keywords"
          type="textarea"
          :rows="4"
          placeholder="请输入站点关键字"
        />
      </el-form-item>

      <el-form-item label="网站备案号" prop="web_website">
        <el-input v-model="formData.web_website" placeholder="请输入备案号" />
      </el-form-item>

      <el-form-item label="配色方案" prop="theme">
        <el-input v-model="formData.theme" placeholder="请输入配色方案" />
      </el-form-item>

      <el-form-item label="版权" prop="web_copyright">
        <el-input v-model="formData.web_copyright" placeholder="请输入版权" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { getSystemSetting, saveSystemSetting, type SystemSetting } from '@/mock/systemSetting'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = reactive<SystemSetting>({
  web_name: '',
  web_company: '',
  web_url: '',
  web_hotline: '',
  web_version: '',
  web_description: '',
  web_keywords: '',
  web_website: '',
  theme: '',
  web_copyright: '',
})

const formRules: FormRules = {
  web_name: [{ required: true, message: '请输入站点名称', trigger: 'blur' }],
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getSystemSetting()
    Object.assign(formData, res.data)
  } catch (err) {
    console.error('加载系统设置失败:', err)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      await saveSystemSetting({ ...formData })
      ElMessage.success('保存成功')
    } catch (err) {
      console.error('保存系统设置失败:', err)
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.system-setting {
  padding: 20px;

  .setting-form {
    max-width: 800px;
  }
}
</style>
