export const routes = {
  login: '/login',
  users: {
    report: '/users/report',
    detail: (userId: string) => `/users/${encodeURIComponent(userId)}`,
  },
} as const;
