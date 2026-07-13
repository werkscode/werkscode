# Production deployment (multi-site VPS)

Deploy WERKSCODE behind **Caddy** on a Linux VPS. Caddy terminates **HTTPS** with free **[Let's Encrypt](https://letsencrypt.org/)** certificates (automatic issue and renewal).

**Canonical URL:** `https://werkscode.de`  
**Redirects:** `werkscode.com`, `werkscode.dev`, and all `www.*` → `https://werkscode.de`

The same VPS can host other sites: each app binds a unique `127.0.0.1` port; Caddy routes by hostname.

## Architecture

```
Internet :80/:443
    → Caddy (host, /etc/caddy/)
        → werkscode.de     → 127.0.0.1:3000 (this repo)
        → other-domain.com → 127.0.0.1:3001 (future project)
    → werkscode Postgres (Docker internal only)
```

### Port allocation (document on server in `/opt/README-ports.md`)

| Port | Service |
|------|---------|
| `3000` | WERKSCODE |
| `3001+` | Next sites |
| `5432` | Not exposed on host in prod |

---

## 1. DNS

Point all WERKSCODE domains to your VPS **public IPv4** (add AAAA if you use IPv6).

| Host | Type | Value |
|------|------|-------|
| `@` on werkscode.de | A | `<VPS_IP>` |
| `www` on werkscode.de | A | `<VPS_IP>` |
| `@` on werkscode.com | A | `<VPS_IP>` |
| `www` on werkscode.com | A | `<VPS_IP>` |
| `@` on werkscode.dev | A | `<VPS_IP>` |
| `www` on werkscode.dev | A | `<VPS_IP>` |

Verify propagation before starting Caddy:

```bash
dig +short werkscode.de
```

---

## 2. VPS bootstrap (one-time)

Ubuntu/Debian assumed. Run as root or with `sudo`.

### System packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ufw
```

### Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
# log out and back in so docker group applies
docker compose version
```

### Caddy (Let's Encrypt built-in)

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

### Server layout

```bash
sudo mkdir -p /opt/werkscode /etc/caddy/sites
```

Clone this repo:

```bash
sudo git clone https://github.com/<your-org>/werkscode.git /opt/werkscode
# or your fork URL — adjust permissions: sudo chown -R $USER:$USER /opt/werkscode
```

---

## 3. WERKSCODE environment

On the server, create `/opt/werkscode/.env` from [`.env.production.example`](../.env.production.example). **Never commit `.env`.**

```bash
cd /opt/werkscode
cp .env.production.example .env
nano .env
```

Example values:

```bash
POSTGRES_USER=werkscode
POSTGRES_PASSWORD=<run: openssl rand -base64 32>
POSTGRES_DB=werkscode
DATABASE_URL=postgresql://werkscode:<password>@db:5432/werkscode
NUXT_DATABASE_URL=postgresql://werkscode:<password>@db:5432/werkscode
NUXT_PUBLIC_APP_URL=https://werkscode.de
NODE_ENV=production
```

`@db` is the Docker service hostname — not `localhost`.

---

## 4. Build and start WERKSCODE

```bash
cd /opt/werkscode
make prod-build
make prod-migrate
make prod-up
make prod-logs
```

Verify the app **before** Caddy:

```bash
curl -s http://127.0.0.1:3000/api/health
# {"status":"ok",...}
```

---

## 5. Caddy configuration

Copy configs from this repo:

```bash
cd /opt/werkscode
sudo cp deploy/caddy/Caddyfile /etc/caddy/Caddyfile
sudo cp deploy/caddy/sites/werkscode.caddy /etc/caddy/sites/
sudo systemctl reload caddy
sudo systemctl status caddy
```

On first HTTPS request, Caddy requests Let's Encrypt certificates for all hostnames in `werkscode.caddy`.

### Verify HTTPS and redirects

```bash
curl -I https://werkscode.de
curl -I https://werkscode.com   # should 301 to werkscode.de
curl -I https://www.werkscode.de  # should 301 to werkscode.de
```

In a browser:

- https://werkscode.de — site loads, padlock shows Let's Encrypt
- https://werkscode.de/de/blog — German routes
- Contact form submits

---

## 6. Updates (code or content)

Blog/portfolio content is **baked into the Docker image** at build time.

```bash
cd /opt/werkscode
git pull
make prod-build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate app
```

Caddy config only changes when domains or ports change.

---

## Add another website on the same VPS

1. Deploy the new app bound to `127.0.0.1:3001` (next free port).
2. Add DNS A records for its domain → same VPS IP.
3. Create `/etc/caddy/sites/my-other-site.caddy`:

```caddy
other-domain.com {
	reverse_proxy 127.0.0.1:3001
}
```

4. `sudo systemctl reload caddy`

WERKSCODE ports and compose are unchanged.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Let's Encrypt fails | DNS not propagated; port 80 blocked; another process on 80/443 |
| `502` from Caddy | App not running; wrong port — test `curl http://127.0.0.1:3000/api/health` |
| Certificate rate limit | Avoid deleting/recreating certs repeatedly same day |
| Content not updating | Run `make prod-build`, not only `git pull` |
| `address already in use` on `127.0.0.1:3000` | Compose merged base `0.0.0.0:3000` with prod — pull latest `docker-compose.prod.yml` (`ports: !override`) and `make prod-up` again |

Reload Caddy after DNS fixes:

```bash
sudo systemctl reload caddy
```

---

## Files in this repo

| Path | Purpose |
|------|---------|
| [`caddy/Caddyfile`](caddy/Caddyfile) | Main config — `import sites/*.caddy` |
| [`caddy/sites/werkscode.caddy`](caddy/sites/werkscode.caddy) | WERKSCODE proxy + domain redirects |
| [`../docker-compose.prod.yml`](../docker-compose.prod.yml) | Prod stack — app on `127.0.0.1:3000` |
