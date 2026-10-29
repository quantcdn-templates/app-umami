# Umami Analytics on Quant Cloud

[![Deploy to Quant Cloud](https://img.shields.io/badge/Deploy%20to-Quant%20Cloud-blue?style=for-the-badge)](https://dashboard.quantcdn.io/deploy/app/app-umami)

[Umami](https://umami.is/) is a simple, fast, privacy-focused alternative to Google Analytics. This template deploys a self-hosted Umami instance on Quant Cloud with PostgreSQL.

## Features

- **Privacy-focused**: No cookies, no personal data collection, GDPR compliant
- **Lightweight**: ~3KB tracking script, minimal performance impact
- **Real-time**: Live visitor dashboard
- **Self-hosted**: Complete data ownership on Quant Cloud

## Quick Start

### Deploy to Quant Cloud

Click the deploy button above, or visit: https://dashboard.quantcdn.io/deploy/app/app-umami

### Local Development

```bash
# Clone the repository
git clone https://github.com/quantcdn-templates/app-umami.git
cd app-umami

# Copy the override file
cp docker-compose.override.yml.example docker-compose.override.yml

# Start the services
docker-compose up -d

# Open http://localhost:3000
# Default login: admin / umami
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Explicit PostgreSQL connection string (overrides managed settings) | For local/custom databases |
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | Injected by Quant Cloud managed PostgreSQL | Automatic on Quant Cloud |
| `DB_SSLMODE` | Managed connection TLS mode; defaults to `require` | Optional |
| `APP_SECRET` | Session secret; on Quant Cloud defaults to a stable HMAC derived from the managed database password and database identity | Required with a custom `DATABASE_URL` |
| `TRACKER_SCRIPT_NAME` | Rename tracking script to avoid ad blockers | No |

Rotating the managed database password also rotates the fallback session secret and signs out existing sessions. Set an explicit `APP_SECRET` to manage session-secret rotation independently.

### Adding to Your Website

1. Log into Umami at your deployed URL
2. Add your website in Settings → Websites
3. Copy the tracking code snippet
4. Add it to your website's `<head>` section:

```html
<script defer src="https://your-umami.example.com/script.js" data-website-id="your-website-id"></script>
```

### Routing Analytics to Your Domain

To receive analytics at `/metrics` on your main domain (avoiding ad blockers):

1. Deploy Umami to Quant Cloud
2. In your Quant project, add a route rule:
   - Path: `/metrics/*`
   - Backend: Your Umami Quant Cloud app
3. Update your tracking script:

```html
<script defer src="/metrics/script.js" data-website-id="your-website-id"></script>
```

## Security

- **Change the default password immediately** after first login
- Use a strong, random `APP_SECRET` in production
- Consider renaming the tracking script via `TRACKER_SCRIPT_NAME`

## Resources

- [Umami Documentation](https://umami.is/docs)
- [Quant Cloud Documentation](https://docs.quantcdn.io/)
- [GitHub Repository](https://github.com/umami-software/umami)

## License

Umami is MIT licensed. This template is provided by Quant Cloud.
