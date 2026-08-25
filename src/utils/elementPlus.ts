import type { App } from 'vue'
import {
  ElButton,
  ElButtonGroup,
  ElIcon,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElInputNumber,
  ElTree,
  ElTreeSelect,
  ElRadio,
  ElRadioGroup,
  ElTabs,
  ElTabPane,
  ElMenu,
  ElMenuItem,
  ElSubMenu,
  ElContainer,
  ElAside,
  ElHeader,
  ElMain,
  ElRow,
  ElCol,
  ElTag,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElAvatar,
  ElBadge,
  ElProgress,
  ElEmpty,
  ElBacktop,
  ElLoading,
  ElImage,
  ElCheckbox,
} from 'element-plus'

// Element Plus 组件样式
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/button-group/style/css'
import 'element-plus/es/components/icon/style/css'
import 'element-plus/es/components/table/style/css'
import 'element-plus/es/components/table-column/style/css'
import 'element-plus/es/components/pagination/style/css'
import 'element-plus/es/components/dialog/style/css'
import 'element-plus/es/components/form/style/css'
import 'element-plus/es/components/form-item/style/css'
import 'element-plus/es/components/input/style/css'
import 'element-plus/es/components/select/style/css'
import 'element-plus/es/components/option/style/css'
import 'element-plus/es/components/date-picker/style/css'
import 'element-plus/es/components/input-number/style/css'
import 'element-plus/es/components/tree/style/css'
import 'element-plus/es/components/tree-select/style/css'
import 'element-plus/es/components/radio/style/css'
import 'element-plus/es/components/radio-group/style/css'
import 'element-plus/es/components/tabs/style/css'
import 'element-plus/es/components/tab-pane/style/css'
import 'element-plus/es/components/menu/style/css'
import 'element-plus/es/components/menu-item/style/css'
import 'element-plus/es/components/sub-menu/style/css'
import 'element-plus/es/components/container/style/css'
import 'element-plus/es/components/aside/style/css'
import 'element-plus/es/components/header/style/css'
import 'element-plus/es/components/main/style/css'
import 'element-plus/es/components/row/style/css'
import 'element-plus/es/components/col/style/css'
import 'element-plus/es/components/tag/style/css'
import 'element-plus/es/components/dropdown/style/css'
import 'element-plus/es/components/dropdown-menu/style/css'
import 'element-plus/es/components/dropdown-item/style/css'
import 'element-plus/es/components/breadcrumb/style/css'
import 'element-plus/es/components/breadcrumb-item/style/css'
import 'element-plus/es/components/avatar/style/css'
import 'element-plus/es/components/badge/style/css'
import 'element-plus/es/components/progress/style/css'
import 'element-plus/es/components/empty/style/css'
import 'element-plus/es/components/backtop/style/css'
import 'element-plus/es/components/loading/style/css'
import 'element-plus/es/components/image/style/css'
import 'element-plus/es/components/checkbox/style/css'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/message/style/css'

const components = [
  { name: 'ElButton', comp: ElButton },
  { name: 'ElButtonGroup', comp: ElButtonGroup },
  { name: 'ElIcon', comp: ElIcon },
  { name: 'ElTable', comp: ElTable },
  { name: 'ElTableColumn', comp: ElTableColumn },
  { name: 'ElPagination', comp: ElPagination },
  { name: 'ElDialog', comp: ElDialog },
  { name: 'ElForm', comp: ElForm },
  { name: 'ElFormItem', comp: ElFormItem },
  { name: 'ElInput', comp: ElInput },
  { name: 'ElSelect', comp: ElSelect },
  { name: 'ElOption', comp: ElOption },
  { name: 'ElDatePicker', comp: ElDatePicker },
  { name: 'ElInputNumber', comp: ElInputNumber },
  { name: 'ElTree', comp: ElTree },
  { name: 'ElTreeSelect', comp: ElTreeSelect },
  { name: 'ElRadio', comp: ElRadio },
  { name: 'ElRadioGroup', comp: ElRadioGroup },
  { name: 'ElTabs', comp: ElTabs },
  { name: 'ElTabPane', comp: ElTabPane },
  { name: 'ElMenu', comp: ElMenu },
  { name: 'ElMenuItem', comp: ElMenuItem },
  { name: 'ElSubMenu', comp: ElSubMenu },
  { name: 'ElContainer', comp: ElContainer },
  { name: 'ElAside', comp: ElAside },
  { name: 'ElHeader', comp: ElHeader },
  { name: 'ElMain', comp: ElMain },
  { name: 'ElRow', comp: ElRow },
  { name: 'ElCol', comp: ElCol },
  { name: 'ElTag', comp: ElTag },
  { name: 'ElDropdown', comp: ElDropdown },
  { name: 'ElDropdownMenu', comp: ElDropdownMenu },
  { name: 'ElDropdownItem', comp: ElDropdownItem },
  { name: 'ElBreadcrumb', comp: ElBreadcrumb },
  { name: 'ElBreadcrumbItem', comp: ElBreadcrumbItem },
  { name: 'ElAvatar', comp: ElAvatar },
  { name: 'ElBadge', comp: ElBadge },
  { name: 'ElProgress', comp: ElProgress },
  { name: 'ElEmpty', comp: ElEmpty },
  { name: 'ElBacktop', comp: ElBacktop },
  { name: 'ElImage', comp: ElImage },
  { name: 'ElCheckbox', comp: ElCheckbox },
]

export function setupElementPlus(app: App) {
  components.forEach(({ name, comp }) => {
    app.component(name, comp)
  })
  app.directive('loading', ElLoading.directive)
}
