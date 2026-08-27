<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="720px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <div class="form-section-title">公司基本信息</div>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="公司名称" prop="companyName">
            <el-input v-model="formData.companyName" placeholder="请输入公司名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="公司简称" prop="companyShortName">
            <el-input v-model="formData.companyShortName" placeholder="请输入公司简称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="法人代表">
            <el-input v-model="formData.legalRepresentative" placeholder="请输入法人代表" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="签约代表人">
            <el-input v-model="formData.signer" placeholder="请输入签约代表人" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="电话">
            <el-input v-model="formData.phone" placeholder="请输入电话" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="传真">
            <el-input v-model="formData.fax" placeholder="请输入传真" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="公司地址">
        <el-input v-model="formData.companyAddress" placeholder="请输入公司地址" />
      </el-form-item>

      <div class="form-section-title">公司发票信息</div>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="发票类型" prop="invoiceType">
            <el-select v-model="formData.invoiceType" placeholder="请选择发票类型" style="width: 100%">
              <el-option label="增值税专用发票" value="增值税专用发票" />
              <el-option label="增值税普通发票" value="增值税普通发票" />
              <el-option label="增值税电子普通发票" value="增值税电子普通发票" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="单位名称" prop="invoiceUnitName">
            <el-input v-model="formData.invoiceUnitName" placeholder="请输入单位名称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="纳税人识别号">
            <el-input v-model="formData.taxId" placeholder="请输入纳税人识别号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="地址">
            <el-input v-model="formData.invoiceAddress" placeholder="请输入地址" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="电话">
            <el-input v-model="formData.invoicePhone" placeholder="请输入电话" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="开户银行">
            <el-input v-model="formData.invoiceBank" placeholder="请输入开户银行" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="开户账号">
        <el-input v-model="formData.invoiceBankAccount" placeholder="请输入开户账号" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="收款人姓名">
            <el-input v-model="formData.payeeName" placeholder="请输入收款人姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="收款人手机">
            <el-input v-model="formData.payeePhone" placeholder="请输入收款人手机" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="收款人地址">
        <el-input v-model="formData.payeeAddress" placeholder="请输入收款人地址" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          maxlength="225"
          show-word-limit
          placeholder="请输入备注信息"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        提交
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { addCompany, updateCompany } from '@/mock/company'
import type { FormInstance, FormRules } from 'element-plus'
import type { CompanyItem } from '@/mock/company'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit'
  record?: CompanyItem | null
}

const props = withDefaults(defineProps<Props>(), {
  record: null,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const formRef = ref<FormInstance>()
const submitting = ref(false)

interface FormData {
  companyName: string
  companyShortName: string
  legalRepresentative: string
  signer: string
  phone: string
  fax: string
  companyAddress: string
  invoiceType: string
  invoiceUnitName: string
  taxId: string
  invoiceAddress: string
  invoicePhone: string
  invoiceBank: string
  invoiceBankAccount: string
  payeeName: string
  payeePhone: string
  payeeAddress: string
  remark: string
}

const defaultFormData = (): FormData => ({
  companyName: '',
  companyShortName: '',
  legalRepresentative: '',
  signer: '',
  phone: '',
  fax: '',
  companyAddress: '',
  invoiceType: '',
  invoiceUnitName: '',
  taxId: '',
  invoiceAddress: '',
  invoicePhone: '',
  invoiceBank: '',
  invoiceBankAccount: '',
  payeeName: '',
  payeePhone: '',
  payeeAddress: '',
  remark: '',
})

const formData = ref<FormData>(defaultFormData())

const formRules: FormRules<FormData> = {
  companyName: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  companyShortName: [{ required: true, message: '请输入公司简称', trigger: 'blur' }],
  invoiceType: [{ required: true, message: '请选择发票类型', trigger: 'change' }],
  invoiceUnitName: [{ required: true, message: '请输入单位名称', trigger: 'blur' }],
}

const dialogTitle = computed(() => {
  return props.mode === 'add' ? '新增公司信息' : '公司信息编辑'
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.mode === 'edit' && props.record) {
        const r = props.record
        formData.value = {
          companyName: r.companyName || '',
          companyShortName: r.companyShortName || '',
          legalRepresentative: r.legalRepresentative || '',
          signer: r.signer || '',
          phone: r.phone || '',
          fax: r.fax || '',
          companyAddress: r.companyAddress || '',
          invoiceType: r.invoiceType || '',
          invoiceUnitName: r.invoiceUnitName || '',
          taxId: r.taxId || '',
          invoiceAddress: r.invoiceAddress || '',
          invoicePhone: r.invoicePhone || '',
          invoiceBank: r.invoiceBank || '',
          invoiceBankAccount: r.invoiceBankAccount || '',
          payeeName: r.payeeName || '',
          payeePhone: r.payeePhone || '',
          payeeAddress: r.payeeAddress || '',
          remark: r.remark || '',
        }
      } else {
        formData.value = defaultFormData()
      }
    }
  }
)

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload = {
        companyName: formData.value.companyName,
        companyShortName: formData.value.companyShortName,
        legalRepresentative: formData.value.legalRepresentative,
        signer: formData.value.signer,
        phone: formData.value.phone,
        fax: formData.value.fax,
        companyAddress: formData.value.companyAddress,
        invoiceType: formData.value.invoiceType,
        invoiceUnitName: formData.value.invoiceUnitName,
        taxId: formData.value.taxId,
        invoiceAddress: formData.value.invoiceAddress,
        invoicePhone: formData.value.invoicePhone,
        invoiceBank: formData.value.invoiceBank,
        invoiceBankAccount: formData.value.invoiceBankAccount,
        payeeName: formData.value.payeeName,
        payeePhone: formData.value.payeePhone,
        payeeAddress: formData.value.payeeAddress,
        remark: formData.value.remark,
      }
      if (props.mode === 'add') {
        await addCompany(payload)
      } else if (props.record) {
        await updateCompany(props.record.id, payload)
      }
      emit('success')
      handleClose()
    } catch (err) {
      console.error(err)
    } finally {
      submitting.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.form-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 8px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}
</style>
