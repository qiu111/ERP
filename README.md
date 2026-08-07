### ERP-Demo
```
基于 Vue 3 + TypeScript + Vite 的企业后台管理系统脚手架，
提供动态路由、按钮级权限、Mock 数据切换、多环境配置等功能。
```
### 特性
```
1、Vue 3 + Vite：Composition API、`<script setup>`、极速冷启动与 HMR
2、Element Plus：按组件手动注册 + 按需样式，打包体积更小
3、动态路由 + 后端菜单驱动**：登录后根据后端返回的功能树动态生成菜单与路由
4、按钮级权限：基于 `function_code:action` 的细粒度 `has()` 权限判断
5、Pinia 持久化：用户登录态、Tabs 状态自动持久化到 `localStorage`
6、Mock 数据一键切换**：开发环境本地 Mock，生产构建自动树摇剔除
7、多环境支持：`development / test / production` 三套构建与预览脚本
8、Axios 封装：统一的 `Result<T>` 响应结构、拦截器错误提示、Token 自动注入
```

### 安装与运行

```bash
# 安装依赖
npm install
npm run dev



```
src/
├── api/                # 接口请求层
│   └── user.ts         # 用户相关接口
├── assets/             # 静态资源
├── components/         # 通用组件
├── composables/        # 组合式函数
├── mock/               # Mock 数据
│   ├── index.ts        # Mock 统一导出
│   └── user.ts         # 用户模块 Mock
├── router/             # 路由配置
├── stores/             # Pinia 状态管理
├── styles/             # 全局样式
├── utils/              # 工具函数
├── views/              # 页面级组件
├── App.vue             # 根组件
├── env.d.ts            # 环境变量类型声明
└── main.ts             # 入口文件
```


```
鉴权通过请求头 `token` 字段传递，由 Axios 请求拦截器自动从 `localStorage` 读取并注入。
```
