const routes = [
  // {
  //   path: '/',
  //   component: () => import('layouts/Login-Signup.vue'),
  //   name: 'Login'
  // },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/FundAccounts.vue') },
      { path: 'loans', component: () => import('src/pages/LoansPage.vue') },
      { path: 'charges', component: () => import('src/pages/ChargesPage.vue') },
      { path: 'members', component: () => import('src/pages/MembersPage.vue') },
      { path: 'transactions', component: () => import('src/pages/TransactionsPage.vue') },
      { path: 'accounts', component: () => import('src/pages/AccountsPage.vue') },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
