// src/mock/user.ts
// 登录、用户信息、导航 mock 数据
import type { LoginResult, UserInfo } from '@/http'

// mock 用户信息
export const mockUserInfo: UserInfo = {
  id: 1,
  username: 'admin',
  name: '管理员',
  roles: ['sys:admin'],
  permissions: ['sys:user', 'sys:role', 'sys:goods'],
}

// mock 登录返回
export const mockLoginResult: LoginResult = {
  token: 'mock-token-admin-123456789',
  userInfo: mockUserInfo,
}

// 导航菜单项类型
export interface NavItem {
  /** 菜单标题 */
  title: string
  /** 路由路径 */
  path: string
  /** Element Plus 图标名（顶级菜单必填，子级可选） */
  icon?: string
  /** 子菜单 */
  children?: NavItem[]
}

// mock 导航/功能数据（供 user store 的 fetchNav 使用）
// 顶层为一级菜单，children 为下级菜单，支持任意层级递归。
export const mockNavData: NavItem[] = [
  // 门户
  {
    title: '门户',
    path: '/portal',
    icon: 'Monitor',
    children: [
      { title: '个人门户', path: '/dashboard' },
      { title: '企业门户', path: '/portal/enterprise' },
    ],
  },
  // OA办公平台
  {
    title: 'OA办公平台',
    path: '/oa',
    icon: 'OfficeBuilding',
    children: [
      {
        title: '日志管理',
        path: '/oa/log',
        children: [
          { title: '工作日志', path: '/oa/log/work' },
          { title: '日志审核', path: '/oa/log/audit' },
        ],
      },
      { title: '每日工作审核', path: '/oa/daily-audit' },
      {
        title: '工作计划管理',
        path: '/oa/plan',
        children: [
          { title: '我的工作计划', path: '/oa/plan/mine' },
          { title: '我安排的工作', path: '/oa/plan/assigned' },
          { title: '部门工作计划', path: '/oa/plan/dept' },
        ],
      },
      { title: '必做任务', path: '/oa/required-task' },
      {
        title: '审批管理',
        path: '/oa/approval',
        children: [
          { title: '待我审批', path: '/oa/approval/todo' },
          { title: '审批模板管理', path: '/oa/approval/template' },
          { title: '我发起的审批', path: '/oa/approval/initiated' },
          { title: '我参与的审批', path: '/oa/approval/involved' },
        ],
      },
      {
        title: '接待管理',
        path: '/oa/reception',
        children: [
          { title: '待我审批接待', path: '/oa/reception/todo' },
          { title: '我发起的接待', path: '/oa/reception/initiated' },
        ],
      },
      {
        title: '公告管理',
        path: '/oa/notice',
        children: [{ title: '公告列表', path: '/oa/notice/list' }],
      },
      { title: '备忘录管理', path: '/oa/memo' },
      {
        title: '工作交接管理',
        path: '/oa/handover',
        children: [{ title: '工作交接列表', path: '/oa/handover/list' }],
      },
      {
        title: '公文收发',
        path: '/oa/document',
        children: [
          { title: '发起公文', path: '/oa/document/create' },
          { title: '公文收件箱', path: '/oa/document/inbox' },
          { title: '待发公文', path: '/oa/document/pending' },
          { title: '我发起的公文', path: '/oa/document/initiated' },
          { title: '待我处理公文', path: '/oa/document/todo' },
          { title: '已处理公文', path: '/oa/document/done' },
          { title: '投票管理', path: '/oa/document/vote' },
        ],
      },
    ],
  },
  // ERP进销存
  {
    title: 'ERP进销存',
    path: '/erp',
    icon: 'Goods',
    children: [
      {
        title: '采购管理',
        path: '/erp/purchase',
        children: [
          { title: '采购订单', path: '/erp/purchase/order' },
          { title: '采购收货', path: '/erp/purchase/receive' },
          { title: '退货返厂', path: '/erp/purchase/return' },
          { title: '合同条款', path: '/erp/purchase/contract-terms' },
          { title: '外贸出货', path: '/erp/purchase/export' },
        ],
      },
      {
        title: '销售管理',
        path: '/erp/sale',
        children: [
          { title: '外销PI', path: '/erp/sale/pi' },
          { title: '销售订单', path: '/erp/sale/order' },
          { title: '销售出库', path: '/erp/sale/outbound' },
          { title: '销售退货', path: '/erp/sale/return' },
        ],
      },
      {
        title: '库存管理',
        path: '/erp/stock',
        children: [
          { title: '商品库存汇总', path: '/erp/stock/summary' },
          { title: '仓库商品明细', path: '/erp/stock/detail' },
          { title: '库存调整', path: '/erp/stock/adjust' },
          { title: '库存调拨', path: '/erp/stock/transfer' },
          { title: '库存盘点', path: '/erp/stock/check' },
          { title: '库存差异查询', path: '/erp/stock/diff' },
          { title: '库存预警设置', path: '/erp/stock/warning' },
        ],
      },
      {
        title: '代理商要货管理',
        path: '/erp/agent',
        children: [
          { title: '代理商要货单', path: '/erp/agent/order' },
          { title: '代理商出库单', path: '/erp/agent/outbound' },
          { title: '代理商退货单', path: '/erp/agent/return' },
        ],
      },
      {
        title: '商品管理',
        path: '/erp/goods',
        children: [
          { title: '自采商品管理', path: '/erp/goods/self' },
          { title: '第三方商品管理', path: '/erp/goods/third' },
          { title: '代理商商品管理', path: '/erp/goods/agent' },
          { title: '商品分类管理', path: '/erp/goods/category' },
          { title: '商品模型管理', path: '/erp/goods/model' },
          { title: '商品规格管理', path: '/erp/goods/spec' },
          { title: '商品属性管理', path: '/erp/goods/attr' },
          { title: '商品品牌管理', path: '/erp/goods/brand' },
        ],
      },
      {
        title: '合同管理',
        path: '/erp/contract',
        children: [
          { title: '外销合同条款', path: '/erp/contract/export-terms' },
          { title: '采购合同', path: '/erp/contract/purchase' },
          { title: '合同收录', path: '/erp/contract/record' },
          { title: '内销合同条款', path: '/erp/contract/domestic-terms' },
          { title: '采购合同条款', path: '/erp/contract/purchase-terms' },
          { title: '合同列表', path: '/erp/contract/list' },
        ],
      },
      {
        title: '基本信息管理',
        path: '/erp/base',
        children: [
          { title: '供应商管理', path: '/erp/base/supplier' },
          { title: '常用银行帐户管理', path: '/erp/base/bank' },
          { title: '物流公司管理', path: '/erp/base/logistics' },
          { title: '仓库列表', path: '/erp/base/warehouse' },
        ],
      },
    ],
  },
  // 审批管理
  {
    title: '审批管理',
    path: '/approval',
    icon: 'Stamp',
    children: [
      { title: '待我审批', path: '/approval/todo' },
      { title: '我发起的审批', path: '/approval/initiated' },
      { title: '修改审批我参与的审批', path: '/approval/involved' },
      { title: '审批列表', path: '/approval/list' },
    ],
  },
  // CRM客户管理
  {
    title: 'CRM客户管理',
    path: '/crm',
    icon: 'UserFilled',
    children: [
      { title: '客户来源', path: '/crm/source' },
      { title: '客户管理', path: '/crm/customer' },
      { title: '商机管理', path: '/crm/opportunity' },
    ],
  },
  // HR人力资源
  {
    title: 'HR人力资源',
    path: '/hr',
    icon: 'User',
    children: [
      { title: '组织架构图管理', path: '/hr/organization' },
      { title: '岗位管理', path: '/hr/position' },
      { title: '员工管理', path: '/hr/employee' },
      {
        title: '招聘管理',
        path: '/hr/recruit',
        children: [
          { title: '招聘管理', path: '/hr/recruit/list' },
          { title: '招聘来源', path: '/hr/recruit/source' },
          { title: '招聘岗位', path: '/hr/recruit/position' },
        ],
      },
      { title: '离职管理', path: '/hr/resign' },
      { title: '考勤管理', path: '/hr/attendance' },
      { title: '人员绩效管理', path: '/hr/staff-performance' },
      { title: '部门绩效管理', path: '/hr/dept-performance' },
    ],
  },
  // 财务管理
  {
    title: '财务管理',
    path: '/finance',
    icon: 'Money',
    children: [
      { title: '退款管理', path: '/finance/refund' },
      { title: '费用管理', path: '/finance/expense' },
      { title: '收入管理', path: '/finance/income' },
      { title: '工资管理', path: '/finance/salary' },
      { title: '费用类型管理', path: '/finance/expense-type' },
      { title: '预算管理', path: '/finance/budget' },
      { title: '账户管理', path: '/finance/account' },
      { title: '账户流水汇总表', path: '/finance/account-flow' },
      { title: '利润提成奖励管理', path: '/finance/profit-bonus' },
      { title: '应付款管理', path: '/finance/payable' },
      { title: '应收款管理', path: '/finance/receivable' },
      { title: '分润管理', path: '/finance/share' },
    ],
  },
  // 系统管理
  {
    title: '系统管理',
    path: '/system',
    icon: 'Setting',
    children: [
      { title: '系统设置', path: '/system/settings' },
      { title: '公司信息管理', path: '/system/company' },
      { title: '用户管理', path: '/system/user' },
      { title: '费用报销请款抬头', path: '/system/expense-title' },
      { title: '角色管理', path: '/system/role' },
      { title: '功能管理', path: '/system/function' },
    ],
  },
]
