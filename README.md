# 🦈 SharkFinn Learning — Commercial Release

Proprietary educational platform developed by **Stefan Neale**.

## 💼 Buy or Deploy

- 🛒 **Commercial license / SaaS access:** Available via [contact@youraitopweb.com.au](mailto:contact@youraitopweb.com.au)
- 🏫 **Educational or white-label use:** Schools or therapy providers can license hosted versions.
- ⚙️ **Self-deployment:** You may fork this repo for evaluation, but production hosting requires a commercial license.

© 2025 Stefan Neale — All Rights Reserved.

## 🚀 Quick Deploy on Railway

1. Push this repo to GitHub (private or public).
2. On [Railway.app](https://railway.app):
   - Create new project → **Deploy from GitHub**
   - Add environment variables:
     - `PORT = 3000`
     - `DATABASE_URL = postgresql://...sslmode=require`
3. Deploy and open `/api/health` to verify.

## ⚙️ Local Development

```bash
npm install
cp .env.example .env
npm start
# open http://localhost:3000
```

## 🔒 License & Legal

This repository is licensed under a proprietary commercial license.
See [LICENSE](LICENSE) and [EULA.md](EULA.md) for details.
