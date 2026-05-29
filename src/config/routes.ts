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
    create: '/jobs/new',
    edit: (jobId: string) => `/jobs/${encodeURIComponent(jobId)}/edit`,
  },
  featureFlags: '/feature-flags',
  apiExplorer: '/api-explorer',
  localisations: '/localisations',
} as const;
