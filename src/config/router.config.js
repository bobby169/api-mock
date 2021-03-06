// eslint-disable-next-line
import { UserLayout, BasicLayout, RouteView, BlankLayout, PageView } from '@/layouts'

export const asyncRouterMap = [

  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: '项目列表' },
    redirect: '/project',
    children: [
      {
        path: '/project',
        name: 'project',
        component: () => import('@/views/Project'),
        meta: { title: '项目列表', keepAlive: true, icon: 'project' },
        permissions: [0]
      },
      {
        path: '/project/:projectId',
        name: 'mock',
        component: () => import('@/views/mock/Index'),
        redirect: '/project/:projectId/all',
        hidden: true,
        meta: { title: 'Mock列表', permission: [0] },
        children: [
          {
            path: '/project/:projectId/:categoryId',
            name: 'mockList',
            component: () => import('@/views/mock/List')
          },
          {
            path: '/project/:projectId/:categoryId/:mockId',
            name: 'mockDetail',
            component: () => import('@/views/mock/detail/Index')
          }
        ]
      },
      {
        path: '/user/profile/:userId',
        name: 'profile',
        hidden: true,
        component: () => import('@/views/user/Profile'),
        meta: { title: '用户信息', keepAlive: true, icon: 'profile' },
        permissions: [0]
      }
    ]
  },
  {
    path: '*', redirect: '/404', hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/RegisterResult')
      }
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }

]
