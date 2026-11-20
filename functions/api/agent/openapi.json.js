export async function onRequestGet({ request }) {
  const server = new URL(request.url).origin

  return Response.json(
    {
      openapi: '3.1.0',
      info: {
        title: 'Magangrad Shared Jobs API',
        version: '1.0.0',
        description: 'Read the shared internship board and submit verified job listings. New listings are unscored until separately reviewed for Maria.',
      },
      servers: [{ url: server }],
      security: [{ bearerAuth: [] }],
      paths: {
        '/api/agent/jobs': {
          get: {
            operationId: 'listSharedJobs',
            summary: 'List recent shared job listings',
            parameters: [{
              name: 'limit', in: 'query', required: false,
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 30 },
            }],
            responses: {
              '200': { description: 'Recent job listings', content: { 'application/json': { schema: { type: 'object', properties: { jobs: { type: 'array', items: { $ref: '#/components/schemas/JobSummary' } } }, required: ['jobs'] } } } },
              '401': { description: 'Missing or invalid agent token' },
            },
          },
          post: {
            operationId: 'addSharedJob',
            summary: 'Add a job listing to the shared board',
            description: 'Submit only a real listing URL and verified details. Duplicate URLs are ignored. The API does not accept match scores because those are profile-specific.',
            requestBody: {
              required: true,
              content: { 'application/json': { schema: { $ref: '#/components/schemas/NewJob' } } },
            },
            responses: {
              '201': { description: 'Listing added', content: { 'application/json': { schema: { type: 'object', properties: { status: { const: 'added' }, job: { $ref: '#/components/schemas/JobSummary' } }, required: ['status', 'job'] } } } },
              '200': { description: 'Duplicate listing URL' },
              '400': { description: 'Invalid listing fields' },
              '401': { description: 'Missing or invalid agent token' },
            },
          },
        },
      },
      components: {
        securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } },
        schemas: {
          JobSummary: {
            type: 'object',
            properties: {
              title: { type: 'string' }, company: { type: 'string' }, location: { type: 'string' },
              workplace: { type: 'string', enum: ['On-site', 'Hybrid', 'Remote'] }, url: { type: 'string', format: 'uri' },
              created_at: { type: 'string', format: 'date-time' },
            },
          },
          NewJob: {
            type: 'object', additionalProperties: false,
            properties: {
              title: { type: 'string', minLength: 1, maxLength: 180 },
              company: { type: 'string', minLength: 1, maxLength: 160 },
              location: { type: 'string', minLength: 1, maxLength: 120 },
              workplace: { type: 'string', enum: ['On-site', 'Hybrid', 'Remote'] },
              url: { type: 'string', format: 'uri', description: 'HTTPS URL of the original job listing' },
              description: { type: 'string', maxLength: 8000 },
              tags: { type: 'array', maxItems: 12, items: { type: 'string', maxLength: 40 } },
            },
            required: ['title', 'company', 'location', 'workplace', 'url'],
          },
        },
      },
    },
    { headers: { 'Cache-Control': 'public, max-age=300', 'X-Content-Type-Options': 'nosniff' } },
  )
}
