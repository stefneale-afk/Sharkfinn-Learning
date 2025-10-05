# 🦈 SharkFinn Learning — Commercial Release

Proprietary educational platform developed by **Stefan Neale**  
Licensed and distributed by **Top Web Directories Pty Ltd**

ABN 12 345 678 901 — Adelaide, South Australia  
📧 Contact: [stefan@topwebdirectories.com](mailto:stefan@topwebdirectories.com)

---

## 💼 Buy or Deploy

- 🛒 **Commercial license / SaaS access:** Available via [stefan@topwebdirectories.com](mailto:stefan@topwebdirectories.com)
- 🏫 **Educational or white-label use:** Schools or therapy providers can license hosted versions.
- ⚙️ **Self-deployment:** You may fork this repo for evaluation, but production hosting requires a commercial license.

© 2025 Stefan Neale — All Rights Reserved.  
Developed and maintained under **Top Web Directories Pty Ltd**.

---

## 💳 Subscribe to SharkFinn Learning

Access the full version for only **$4.99 AUD per month** — cancel anytime.

👉 *PayPal integration coming soon.*  
Once live, a secure “Subscribe” button will appear here.

---

## 🚀 Quick Deploy on Railway

1. Push this repo to GitHub (private or public).  
2. On [Railway.app](https://railway.app):  
   - Create new project → **Deploy from GitHub**  
   - Add environment variables:
     ```
     PORT=3000
     DATABASE_URL=postgresql://...sslmode=require
     ```
3. Deploy and open `/api/health` to verify your deployment.

---

## ⚙️ Local Development

```bash
npm install
cp .env.example .env
npm start
# open http://localhost:3000
