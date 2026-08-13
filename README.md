### ERP-Demo
```
基于 Vue 3 + TypeScript + Vite 的企业后台管理系统脚手架，
提供动态路由、按钮级权限、Mock 数据切换、多环境配置等开箱即用的能力。
```
### 特性
```
1、Vue 3 + Vite**：Composition API、`<script setup>`、极速冷启动与 HMR
2、Element Plus**：按组件手动注册 + 按需样式，打包体积更小
3、动态路由 + 后端菜单驱动**：登录后根据后端返回的功能树动态生成菜单与路由
4、按钮级权限**：基于 `function_code:action` 的细粒度 `has()` 权限判断
5、Pinia 持久化**：用户登录态、Tabs 状态自动持久化到 `localStorage`
6、Mock 数据一键切换**：开发环境本地 Mock，生产构建自动树摇剔除
7、多环境支持**：`development / test / production` 三套构建与预览脚本
8、Axios 封装**：统一的 `Result<T>` 响应结构、拦截器错误提示、Token 自动注入
```

### 安装与运行

```bash
# 安装依赖
npm install
npm run dev


```
src/
├── api/                # 业务接口（user.ts、function.ts），内部根据 isMockEnabled() 动态切换
├── assets/             # 静态资源
├── components/         # 通用组件（SearchBar、CommonTable 等）
├── composables/        # 组合式函数（usePermission）
├── http/               # Axios 封装 + Result<T> 类型
├── layout/             # Layout 框架（Header、Menu、Tabs、Index）
├── mock/               # 本地 Mock 数据（仅开发时生效）
├── router/             # 路由表 + 全局守卫
├── store/              # Pinia stores（user、menu、tabs）
├── styles/             # 全局样式、滚动条样式
├── types/              # 全局类型（NavItem、UserInfo、LoginResult）
├── utils/              # 工具函数（dynamicRoutes.ts、menuIcons.ts）
├── views/              # 页面视图
│   ├── dashboard/      # 个人门户
│   ├── login/          # 登录页
│   ├── system/         # 系统管理（用户/角色/功能）
│   └── 404.vue         # 未找到页
├── App.vue
└── main.ts             # 入口：注册 Element Plus 组件 / 指令、Pinia、Router
```
```
鉴权通过请求头 `token` 字段传递，由 Axios 请求拦截器自动从 `localStorage` 读取并注入。
```
