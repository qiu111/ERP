export interface NavItem {
  title: string
  path: string
  icon?: string
  children?: NavItem[]
}

export interface UserInfo {
  id: number
  username: string
  name: string
  roles: string[]
  permissions: string[]
}

export interface LoginResult {
  token: string
  userInfo: UserInfo
}