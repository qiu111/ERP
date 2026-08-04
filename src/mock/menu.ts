// src/mock/menu.ts
// 菜单/功能 mock 数据
// 结构对齐 src/utils/dynamicRoutes.ts 的 BackendFunction，
// 生成路由后与 src/layout/menu/MenuBar.vue 硬编码侧边栏路径一致：
//   /system → /userList、/roleList
//   /goodsRoot → /category、/goodsList
// function_code 命中 dynamicRoutes.ts 的 componentMap（userList/roleList/my_center）。
import type { BackendFunction } from '@/utils/dynamicRoutes'

// 补全 BackendFunction 的全部字段，减少重复
function item(partial: Partial<BackendFunction> & {
  id: string
  pid: string
  text: string
  function_code: string
  url: string
}): BackendFunction {
  return {
    function_id: partial.id,
    function_name: partial.text,
    function_url: partial.url,
    function_pid: partial.pid,
    group_code: partial.group_code ?? 'sys',
    function_code: partial.function_code,
    function_type: partial.function_type ?? 'menu',
    function_icon: partial.function_icon ?? partial.iconCls ?? '',
    function_order: partial.function_order ?? '0',
    add_user: partial.add_user ?? 'admin',
    status: partial.status ?? '1',
    update_time: partial.update_time ?? '',
    add_time: partial.add_time ?? '',
    memo: partial.memo ?? '',
    id: partial.id,
    pid: partial.pid,
    text: partial.text,
    iconCls: partial.iconCls ?? partial.function_icon ?? '',
    url: partial.url,
    state: partial.state ?? 'open',
  }
}

export const mockMenuList: BackendFunction[] = [
  // 系统管理（根）
  item({
    id: '10', pid: '0', text: '系统管理', function_code: 'system',
    url: '/system', function_icon: 'Setting', group_code: 'sys',
  }),
  item({
    id: '11', pid: '10', text: '用户管理', function_code: 'userList',
    url: '/userList', function_icon: 'UserFilled', group_code: 'sys',
  }),
  item({
    id: '12', pid: '10', text: '角色管理', function_code: 'roleList',
    url: '/roleList', function_icon: 'Wallet', group_code: 'sys',
  }),
  // 商品管理（根）
  item({
    id: '20', pid: '0', text: '商品管理', function_code: 'goodsRoot',
    url: '/goodsRoot', function_icon: 'Setting', group_code: 'goods',
  }),
  item({
    id: '21', pid: '20', text: '物资类型', function_code: 'category',
    url: '/category', function_icon: 'UserFilled', group_code: 'goods',
  }),
  item({
    id: '22', pid: '20', text: '商品信息', function_code: 'goodsList',
    url: '/goodsList', function_icon: 'Wallet', group_code: 'goods',
  }),
]
