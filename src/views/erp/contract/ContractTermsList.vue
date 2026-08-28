<template>
  <div class="contract-terms-list">
    <SearchBar
      :title="pageTitle"
      :fields="searchFields"
      v-model="searchModel"
      @search="loadData"
      @reset="handleReset"
    />

    <div class="contract-terms-list__table-wrap">
      <CommonTable
        v-loading="loading"
        :columns="columns"
        :data="filteredRows"
        :row-key="'rowKey'"
        height="100%"
        @row-click="handleRowClick"
      >
        <template #column-contractNo="{ row }">
          <el-link type="primary" :underline="'hover'" @click.stop="handleRowClick(row as TermsRow)">
            {{ (row as TermsRow).contractNo }}
          </el-link>
        </template>
      </CommonTable>
    </div>

    <!-- 完整条款抽屉 -->
    <el-drawer v-model="drawerVisible" :title="drawerTitle" size="620px" destroy-on-close>
      <template v-if="drawerContract">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="合同编号">{{ drawerContract.contractNo }}</el-descriptions-item>
          <el-descriptions-item label="合同名称">{{ drawerContract.name }}</el-descriptions-item>
          <el-descriptions-item label="合同类型">
            <el-tag :type="typeTagTypeMap[drawerContract.type]" effect="light" size="small">
              {{ typeLabel[drawerContract.type] }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="合同状态">
            <el-tag :type="statusTagTypeMap[drawerContract.status]" effect="light" size="small">
              {{ statusLabel[drawerContract.status] }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="对方单位">{{ drawerContract.party }}</el-descriptions-item>
          <el-descriptions-item label="合同金额">￥{{ drawerContract.amount.toLocaleString('zh-CN') }}</el-descriptions-item>
          <el-descriptions-item label="签订日期">{{ drawerContract.signDate }}</el-descriptions-item>
          <el-descriptions-item label="履行期限">{{ drawerContract.startDate }} ~ {{ drawerContract.endDate }}</el-descriptions-item>
          <el-descriptions-item label="经办人">{{ drawerContract.handler }}</el-descriptions-item>
        </el-descriptions>

        <div class="terms-block">
          <h4 class="terms-block__title">合同条款（共 {{ drawerContract.terms.length }} 条）</h4>
          <el-table v-if="drawerContract.terms.length" :data="drawerContract.terms" border>
            <el-table-column prop="termName" label="条款名称" width="150" />
            <el-table-column prop="content" label="条款内容" />
          </el-table>
          <el-empty v-else description="该合同暂无条款" :image-size="60" />
        </div>

        <div v-if="drawerContract.attachments.length" class="terms-block">
          <h4 class="terms-block__title">附件</h4>
          <div class="terms-block__tags">
            <el-tag v-for="a in drawerContract.attachments" :key="a" effect="plain">{{ a }}</el-tag>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchField } from '@/components/SearchBar.vue'
import useListPage from '@/composables/useListPage'
import {
  getContractPage,
  getContractById,
  typeLabel,
  typeTagTypeMap,
  statusLabel,
  statusTagTypeMap,
  type ContractItem,
  type ContractType,
} from '@/mock/contract'

/**
 * 通用条款查看页：由路由 meta.functionCode 决定固定过滤的合同类型
 * - erp_contract_export_terms → 外销
 * - erp_contract_domestic_terms → 内销
 * - erp_contract_purchase_terms / erp_purchase_contract_terms → 采购
 */
const TYPE_BY_FUNCTION_CODE: Record<string, ContractType> = {
  erp_contract_export_terms: 'export',
  erp_contract_domestic_terms: 'domestic',
  erp_contract_purchase_terms: 'purchase',
  erp_purchase_contract_terms: 'purchase',
}

const route = useRoute()
const contractType = computed<ContractType>(
  () => TYPE_BY_FUNCTION_CODE[String(route.meta.functionCode)] ?? 'export'
)
const pageTitle = computed(() => `${typeLabel[contractType.value]}合同条款`)

/** 条款汇总行（合同 × 条款展开） */
interface TermsRow {
  rowKey: string
  contractId: string
  contractNo: string
  contractName: string
  termName: string
  content: string
}

const allRows = ref<TermsRow[]>([])
const drawerVisible = ref(false)
const drawerContract = ref<ContractItem | null>(null)

const searchModel = reactive<Record<string, any>>({
  keyword: '',
})

const searchFields: SearchField[] = [
  {
    prop: 'keyword',
    label: '关键字查询:',
    type: 'input',
    placeholder: '编号/名称/条款',
  },
]

const { loading } = useListPage()

const columns: TableColumn[] = [
  { prop: 'contractNo', label: '合同编号', width: 150, align: 'center' },
  { prop: 'contractName', label: '合同名称', minWidth: 200 },
  { prop: 'termName', label: '条款名称', width: 170 },
  { prop: 'content', label: '条款内容', minWidth: 320 },
]

// 加载该类型全部合同并展开为条款汇总行（客户端过滤 + 分页）
const loadData = async () => {
  loading.value = true
  try {
    const res = await getContractPage({ page: 1, pageSize: 500, types: [contractType.value] })
    const rows: TermsRow[] = []
    res.data.list.forEach((c) => {
      c.terms.forEach((t, i) => {
        rows.push({
          rowKey: `${c.id}_${i}`,
          contractId: c.id,
          contractNo: c.contractNo,
          contractName: c.name,
          termName: t.termName,
          content: t.content,
        })
      })
    })
    allRows.value = rows
  } catch (e) {
    console.error('加载合同条款汇总失败:', e)
  } finally {
    loading.value = false
  }
}

const filteredRows = computed<TermsRow[]>(() => {
  const kw = (searchModel.keyword || '').toLowerCase()
  if (!kw) return allRows.value
  return allRows.value.filter(
    (r) =>
      r.contractNo.toLowerCase().includes(kw) ||
      r.contractName.toLowerCase().includes(kw) ||
      r.termName.toLowerCase().includes(kw) ||
      r.content.toLowerCase().includes(kw)
  )
})

const handleReset = () => {
  searchModel.keyword = ''
  loadData()
}

// ========== 点击行查看完整条款 ==========
const drawerTitle = computed(() =>
  drawerContract.value ? `合同 ${drawerContract.value.contractNo} 完整条款` : '合同完整条款'
)

const handleRowClick = async (row: TermsRow) => {
  const res = await getContractById(row.contractId)
  if (res.code === 200 && res.data && res.data.id) {
    drawerContract.value = res.data
    drawerVisible.value = true
  }
}

onMounted(() => loadData())
</script>

<style scoped lang="scss">
.contract-terms-list {
  display: flex;
  flex-direction: column;
  padding: 16px;
  height: calc(100vh - 100px);
  overflow: hidden;

  &__table-wrap {
    flex: 1;
    min-height: 0;
    background: #fff;
    border-radius: 4px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.terms-block {
  margin-top: 16px;

  &__title {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
