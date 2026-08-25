import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export interface ListPagination {
  currentPage: number
  pageSize: number
  total: number
}

export interface ListPageParams {
  defaultPageSize?: number
}

/**
 * 通用列表页可组合函数
 * 封装：分页状态、页面变化、搜索/重置、删除确认、加载态
 */
export function useListPage(options: ListPageParams = {}) {
  const { defaultPageSize = 10 } = options

  const currentPage = ref(1)
  const pageSize = ref(defaultPageSize)
  const total = ref(0)
  const loading = ref(false)
  const searchParams = reactive<Record<string, any>>({})

  const pagination: ListPagination = reactive({
    get currentPage() {
      return currentPage.value
    },
    set currentPage(v) {
      currentPage.value = v
    },
    get pageSize() {
      return pageSize.value
    },
    set pageSize(v) {
      pageSize.value = v
    },
    get total() {
      return total.value
    },
    set total(v) {
      total.value = v
    },
  })

  /** 触发数据加载的回调，由外部传入 */
  let onLoadData: (() => void) | null = null
  const setLoadFn = (fn: () => void) => {
    onLoadData = fn
  }

  const handlePageChange = (page: number, size: number) => {
    currentPage.value = page
    pageSize.value = size
    onLoadData?.()
  }

  const handleSizeChange = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
    onLoadData?.()
  }

  /** 设置搜索条件并重置页码、重新加载 */
  const triggerSearch = (params: Record<string, any>, loadFn?: () => void) => {
    Object.assign(searchParams, params)
    currentPage.value = 1
    if (loadFn) {
      loadFn()
    } else {
      onLoadData?.()
    }
  }

  /** 重置搜索条件并重新加载 */
  const triggerReset = (
    resetKeys: string[],
    values: Record<string, any>,
    loadFn?: () => void
  ) => {
    resetKeys.forEach((k) => {
      searchParams[k] = undefined
      delete searchParams[k]
    })
    // 同时重置外部传入的表单引用
    Object.keys(values).forEach((k) => {
      searchParams[k] = values[k]
    })
    currentPage.value = 1
    if (loadFn) {
      loadFn()
    } else {
      onLoadData?.()
    }
  }

  /**
   * 通用删除确认与执行
   * @param deleteApi 删除请求函数 (id) => Promise<any>
   * @param record    当前行数据（支持 {id, name}）
   * @param label     行标签，用于提示文案（默认取 record.name 或 record.productName）
   */
  const confirmDelete = async <T extends { id: string; name?: string; productName?: string }>(
    deleteApi: (id: string) => Promise<any>,
    record: T,
    label?: string
  ): Promise<boolean> => {
    const tip = label || record.name || record.productName || '该条记录'
    try {
      await ElMessageBox.confirm(`确定删除「${tip}」吗？删除后无法恢复`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
    } catch {
      return false
    }
    try {
      loading.value = true
      await deleteApi(record.id)
      ElMessage.success('删除成功')
      onLoadData?.()
      return true
    } catch (err) {
      console.error(err)
      ElMessage.error('删除失败')
      return false
    } finally {
      loading.value = false
    }
  }

  /** 快速构造一组通用 handle：搜索/重置/删除（基于 onLoadData） */
  const makeHandlers = <T extends { id: string; name?: string; productName?: string }>(
    config: {
      searchForm?: Record<string, any>
      resetKeys?: string[]
      deleteApi?: (id: string) => Promise<any>
      loadFn?: () => void
    } = {}
  ) => {
    const { searchForm = {}, resetKeys = [], deleteApi, loadFn } = config
    const handleSearch = () => {
      triggerSearch(searchForm, loadFn)
    }
    const handleReset = () => {
      Object.keys(searchForm).forEach((k) => {
        if (resetKeys.length === 0 || resetKeys.includes(k)) {
          (searchForm as any)[k] = typeof (searchForm as any)[k] === 'boolean' ? false : ''
        }
      })
      triggerReset(
        Object.keys(searchForm),
        Object.fromEntries(Object.keys(searchForm).map((k) => [k, (searchForm as any)[k]])),
        loadFn
      )
    }
    const handleDelete = async (record: T, label?: string) => {
      if (!deleteApi) return false
      return confirmDelete(deleteApi, record, label)
    }
    return { handleSearch, handleReset, handleDelete }
  }

  return {
    // state
    currentPage,
    pageSize,
    total,
    loading,
    searchParams,
    pagination,
    // loaders
    setLoadFn,
    // event handlers
    handlePageChange,
    handleSizeChange,
    triggerSearch,
    triggerReset,
    confirmDelete,
    makeHandlers,
  }
}

export default useListPage