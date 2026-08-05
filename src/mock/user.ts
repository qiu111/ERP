import type { LoginResult, UserInfo } from '@/types'

export type { NavItem } from '@/types'

export const mockUserInfo: UserInfo = {
  id: 1,
  username: 'admin',
  name: '管理员',
  roles: ['sys:admin'],
  permissions: [
    'my_center',
    'userList',
    'roleList',
    'functionList',
    'userList:add',
    'userList:edit',
    'userList:toggle',
    'userList:dataPermission',
    'roleList:add',
    'roleList:edit',
    'roleList:grant',
    'roleList:toggle',
    'functionList:add',
    'functionList:edit',
    'functionList:toggle',
    'functionList:delete',
  ],
}

export const mockLoginResult: LoginResult = {
  token: 'mock-token-admin-123456789',
  userInfo: mockUserInfo,
}