// Path is mirrored from `../majstorbg-backend/src/main.ts` —
// `SwaggerModule.setup('api/docs', ...)`. If the BE moves it, update here.
export const SWAGGER_PATH = '/api/docs';

export const API_EXPLORER_LABELS = {
  heading: 'API Explorer',
  description:
    "Embedded Swagger UI for the Majstor.bg backend. Use the schema browser to inspect endpoints and trigger requests against the configured API host.",
  openInNewTab: 'Open in new tab',
  iframeTitle: 'Backend API Swagger UI',
} as const;
