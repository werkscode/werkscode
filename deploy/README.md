# Production deployment (multi-site VPS)

Deploy WERKSCODE behind **Caddy** on a Linux VPS. Caddy terminates **HTTPS** with free **[Let's Encrypt](https://letsencrypt.org/)** certificates (automatic issue and renewal).

**Canonical URL:** `https://werkscode.de`  
**Redirects:** `werkscode.com`, `werkscode.dev`, and all `www.*` → `https://werkscode.de`

The same VPS can host other sites: each app binds a unique `127.0.0.1` port; Caddy routes by hostname.

## Architecture

```
Internet :80/:443
    → Caddy (host, /etc/caddy/)
        → werkscode.de              → 127.0.0.1:3000 (this repo root)
        → other-domain.com          → 127.0.0.1:3001 (future project)
    → Postgres containers (Docker internal only)
    → CrowdSec engine (optional, Docker) reads Caddy JSON logs
      LAPI on 127.0.0.1:8080 only — do not open 8080 in the firewall
```

### Port allocation (document on the server in `/opt/README-ports.md`)

| Port | Service |
|------|---------|
| `3000` | WERKSCODE |
| `3001+` | Next sites |
| `5432` | Not exposed on host in prod |
| `8080` | CrowdSec LAPI, `127.0.0.1` only (if enabled) |

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
sudo git clone https://github.com/werkscode/werkscode.git /opt/werkscode
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

**Contact form** (optional but recommended):

```bash
# Resend — verify werkscode.de at https://resend.com/domains first
NUXT_RESEND_API_KEY=re_...
NUXT_CONTACT_FROM_EMAIL=contact@werkscode.de
NUXT_CONTACT_NOTIFY_EMAIL=you@example.com

# Admin inbox — bookmark https://werkscode.de/admin/messages
NUXT_CONTACT_ADMIN_TOKEN=<run: openssl rand -hex 32>
```

Until Resend verifies your domain, use `onboarding@resend.dev` as `NUXT_CONTACT_FROM_EMAIL` for testing. List recent submissions: `make prod-messages`.

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

## 5b. CrowdSec (optional)

CrowdSec reads Caddy's JSON access log and creates bans from the `crowdsecurity/caddy` scenarios (scans, repeated 404s, and the other base HTTP scenarios). The **Caddy bouncer** enforces them. The app is only reachable through Caddy, so there is no firewall bouncer. `make dev` and `make prod-up` do not start CrowdSec.

### Local test

```bash
make crowdsec-up
```

If `.env.crowdsec` is missing, that target writes a bouncer key into it. The file is gitignored. Do not commit it.

What starts:

- `crowdsecurity/crowdsec:v1.8.2`, LAPI on `127.0.0.1:8080`
- a local Caddy build with the CrowdSec HTTP module, on `127.0.0.1:8088`

That Caddy is a localhost stand-in for host Caddy. It trusts private peers so a test can send `X-Forwarded-For` with a documentation address (`203.0.113.0/24`). Do not copy that `trusted_proxies` block into the public Caddyfile.

```bash
curl -sS -D- http://127.0.0.1:8088/api/health
docker compose --env-file .env.crowdsec -f docker-compose.crowdsec.yml exec crowdsec cscli decisions list
make crowdsec-down
```

### Server

1. In `/opt/werkscode/.env`, set `CROWDSEC_BOUNCER_KEY` (`openssl rand -hex 32`) and `CROWDSEC_CADDY_LOGS=/var/log/caddy`.
2. Create the log directory: `sudo mkdir -p /var/log/caddy && sudo chown caddy:caddy /var/log/caddy && sudo chmod 750 /var/log/caddy`
3. Start the engine: `make crowdsec-prod-up`. Confirm `ss -ltn` shows `127.0.0.1:8080` and not `0.0.0.0:8080`. Do not `ufw allow 8080`.
4. Install a Caddy binary that includes `github.com/hslatman/caddy-crowdsec-bouncer/http@v0.15.0`. The distro package does not know the `crowdsec` directive.

```bash
curl -fsSL -o /tmp/caddy "https://caddyserver.com/api/download?os=linux&arch=amd64&p=github.com/hslatman/caddy-crowdsec-bouncer/http@v0.15.0"
sudo dpkg-divert --local --divert /usr/bin/caddy.default --rename /usr/bin/caddy
sudo install -m 755 /tmp/caddy /usr/bin/caddy
caddy version
```

Use `arch=arm64` on an ARM VPS. `dpkg-divert` keeps a later `apt upgrade` from putting the stock binary back.

5. Give the key to the Caddy service, not to the site file:

```bash
sudo install -m 640 -o root -g caddy /dev/null /etc/caddy/crowdsec.env
# one line, same value as CROWDSEC_BOUNCER_KEY in .env:
# CROWDSEC_BOUNCER_KEY=...
sudo systemctl edit caddy
```

```
[Service]
EnvironmentFile=/etc/caddy/crowdsec.env
```

6. Merge [`crowdsec/Caddyfile.production`](crowdsec/Caddyfile.production) into `/etc/caddy/Caddyfile` (global `crowdsec` block) and the `werkscode.de` site. Do not set `trusted_proxies`. Then `sudo systemctl restart caddy`.

Console enrollment is not part of this setup. Do not set `ENROLL_KEY` unless you decide to enroll the engine yourself.

To rotate the bouncer key, update `.env` and `/etc/caddy/crowdsec.env`, delete the old bouncer, and recreate the engine:

```bash
docker compose --env-file .env -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.crowdsec.yml exec crowdsec cscli bouncers delete caddy
make crowdsec-prod-up
sudo systemctl restart caddy
```

---

## 6. Updates (code or content)

Blog and page content is **baked into the Docker image** at build time.

### Automatic (GitHub Actions)

Pushes to `main` run [`.github/workflows/deploy-production.yml`](../.github/workflows/deploy-production.yml):

1. Build **WERKSCODE** in CI
2. SSH to the VPS and run [`scripts/deploy-prod.sh`](../scripts/deploy-prod.sh)

That script pulls the repo and deploys the main site.

**One-time GitHub setup** (repo → Settings → Secrets and variables → Actions):

| Secret | Example | Required |
|--------|---------|----------|
| `DEPLOY_HOST` | VPS public IP or hostname | yes |
| `DEPLOY_USER` | Linux user with Docker access | yes |
| `DEPLOY_SSH_KEY` | Private key (PEM) for that user | yes |
| `DEPLOY_PORT` | `22` | no |
| `DEPLOY_PATH` | `/opt/werkscode` | no |

Create repo → Settings → Environments → **production** (optional but recommended for deploy approval gates).

**One-time VPS setup for deploys:**

```bash
# On your laptop — dedicated deploy key (no passphrase for CI)
ssh-keygen -t ed25519 -f ~/.ssh/werkscode-deploy -N ""
cat ~/.ssh/werkscode-deploy.pub   # add this line to VPS ~/.ssh/authorized_keys

# Paste private key into GitHub secret DEPLOY_SSH_KEY
cat ~/.ssh/werkscode-deploy
```

On the server, ensure the deploy user can run Docker without sudo and the repo is checked out:

```bash
sudo usermod -aG docker "$USER"
cd /opt/werkscode && git remote -v   # should point at github.com/werkscode/werkscode
chmod +x scripts/deploy-prod.sh
```

Test manually before relying on Actions:

```bash
cd /opt/werkscode
make prod-deploy
```

Trigger a deploy from GitHub: Actions → **Deploy production** → **Run workflow**.

### Manual

```bash
cd /opt/werkscode
make prod-deploy
```

Or step by step:

```bash
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
| [`crowdsec/`](crowdsec/) | CrowdSec acquisition, profiles, local and production Caddy bouncer |
| [`../docker-compose.crowdsec.yml`](../docker-compose.crowdsec.yml) | CrowdSec engine (and local bouncer profile) |
| [`../scripts/deploy-prod.sh`](../scripts/deploy-prod.sh) | Production deploy (main site) |
| [`../.github/workflows/deploy-production.yml`](../.github/workflows/deploy-production.yml) | CI build + SSH deploy on push to `main` |
| [`../.github/workflows/ci.yml`](../.github/workflows/ci.yml) | PR build check (WERKSCODE) |
| [`../docker-compose.prod.yml`](../docker-compose.prod.yml) | Prod stack — app on `127.0.0.1:3000` |
