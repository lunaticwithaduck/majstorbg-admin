export const routes = {
  login: '/login',
  users: {
    report: '/users/report',
    detail: (userId: string) => `/users/${encodeURIComponent(userId)}`,
    create: '/users/new',
    edit: (userId: string) => `/users/${encodeURIComponent(userId)}/edit`,
  },
  jobs: {
    explorer: '/jobs',
    detail: (jobId: string) => `/jobs/${encodeURIComponent(jobId)}`,
  },
  featureFlags: '/feature-flags',
  apiExplorer: '/api-explorer',
} as const;
