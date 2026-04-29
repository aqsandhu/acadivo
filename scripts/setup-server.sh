#!/bin/bash
# =============================================================================
# Acadivo — Server Provisioning Script
# Sets up a fresh Ubuntu server for Acadivo production deployment
# =============================================================================
# Usage: ./scripts/setup-server.sh [STAGING|PRODUCTION]
# =============================================================================

set -euo pipefail

ENVIRONMENT="${1:-production}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

log_info "Setting up Acadivo $ENVIRONMENT server..."

# ── Update System ──────────────────────────────────────────────────────────
log_info "Updating system packages..."
apt-get update
apt-get upgrade -y

# ── Install Prerequisites ────────────────────────────────────────────────────
log_info "Installing prerequisites..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    git \
    htop \
    ufw \
    fail2ban \
    certbot \
    python3-certbot-nginx \
    jq \
    unzip \
    tree

log_ok "Prerequisites installed"

# ── Install Docker ───────────────────────────────────────────────────────────
log_info "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Add current user to docker group
    usermod -aG docker "${SUDO_USER:-$USER}" || true

    log_ok "Docker installed"
else
    log_ok "Docker already installed"
fi

# ── Install Docker Compose ─────────────────────────────────────────────────
if ! docker compose version &> /dev/null; then
    apt-get install -y docker-compose-plugin
    log_ok "Docker Compose plugin installed"
else
    log_ok "Docker Compose already available"
fi

# ── Create Project Directories ─────────────────────────────────────────────
log_info "Creating project directories..."
PROJECT_DIR="/opt/acadivo"
mkdir -p "$PROJECT_DIR"/{backups,logs,scripts,docker,security}
mkdir -p "$PROJECT_DIR"/monitoring/{grafana,dashboards,datasources}
mkdir -p /var/www/certbot

log_ok "Directories created: $PROJECT_DIR"

# ── Configure Firewall (UFW) ─────────────────────────────────────────────────
log_info "Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw allow 9090/tcp  # Prometheus
ufw allow 3001/tcp  # Grafana
ufw --force enable

log_ok "Firewall configured"

# ── Configure Fail2Ban ───────────────────────────────────────────────────────
log_info "Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
EOF

systemctl restart fail2ban
log_ok "Fail2ban configured"

# ── Setup Log Rotation ───────────────────────────────────────────────────
log_info "Configuring log rotation..."
cat > /etc/logrotate.d/acadivo << 'EOF'
/opt/acadivo/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
    sharedscripts
    postrotate
        /usr/bin/docker kill --signal=USR1 acadivo-nginx 2>/dev/null || true
    endscript
}
EOF

log_ok "Log rotation configured"

# ── Setup SSL with Certbot (Manual DNS validation or HTTP) ────────────────
log_info "SSL setup: Run certbot manually after DNS is configured"
log_info "  certbot certonly --standalone -d acadivo.com -d www.acadivo.com"

# ── Setup Monitoring Prerequisites ─────────────────────────────────────────
log_info "Setting up monitoring directories..."
mkdir -p /opt/acadivo/monitoring/prometheus-data
mkdir -p /opt/acadivo/monitoring/grafana-data
chown -R 472:472 /opt/acadivo/monitoring/grafana-data  # Grafana UID

log_ok "Monitoring directories ready"

# ── Setup Swap (for smaller instances) ─────────────────────────────────────
SWAP_SIZE="2G"
if [ ! -f /swapfile ]; then
    log_info "Creating ${SWAP_SIZE} swap file..."
    fallocate -l $SWAP_SIZE /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    log_ok "Swap configured"
fi

# ── Kernel Tuning ──────────────────────────────────────────────────────────
log_info "Applying kernel tuning for networking..."
cat >> /etc/sysctl.conf << 'EOF'
# Acadivo network optimization
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15
vm.swappiness = 10
EOF

sysctl -p
log_ok "Kernel tuning applied"

# ── Create Deployment User ─────────────────────────────────────────────────
DEPLOY_USER="deploy"
if ! id "$DEPLOY_USER" &>/dev/null; then
    log_info "Creating deployment user: $DEPLOY_USER"
    useradd -m -s /bin/bash -G docker "$DEPLOY_USER"
    mkdir -p /home/$DEPLOY_USER/.ssh
    touch /home/$DEPLOY_USER/.ssh/authorized_keys
    chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
    chmod 700 /home/$DEPLOY_USER/.ssh
    chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys
    log_ok "Deployment user created: $DEPLOY_USER"
fi

# ── Install Node Exporter (for Prometheus) ────────────────────────────────
log_info "Installing Node Exporter..."
NODE_EXPORTER_VERSION="1.7.0"
if [ ! -f /usr/local/bin/node_exporter ]; then
    cd /tmp
    curl -LO https://github.com/prometheus/node_exporter/releases/download/v${NODE_EXPORTER_VERSION}/node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz
    tar xzf node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz
    cp node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64/node_exporter /usr/local/bin/
    rm -rf node_exporter-*

    # Create systemd service
    cat > /etc/systemd/system/node_exporter.service << EOF
[Unit]
Description=Node Exporter
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/node_exporter
Restart=always

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable node_exporter
    systemctl start node_exporter
    log_ok "Node Exporter installed"
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
log_ok "✅ Server provisioning completed!"
echo ""
log_info "Next steps:"
log_info "  1. Clone the repository: git clone <repo> $PROJECT_DIR"
log_info "  2. Copy .env.production to $PROJECT_DIR"
log_info "  3. Setup SSL: certbot certonly --standalone -d your-domain.com"
log_info "  4. Run: cd $PROJECT_DIR && docker compose up -d"
log_info "  5. Add your SSH key to /home/$DEPLOY_USER/.ssh/authorized_keys"
log_info "  6. Configure GitHub Actions secrets for deployment"
echo ""
log_info "Server info:"
log_info "  OS: $(lsb_release -ds)"
log_info "  Docker: $(docker --version)"
log_info "  Compose: $(docker compose version)"
log_info "  Memory: $(free -h | awk '/^Mem:/ {print $2}')"
log_info "  Disk: $(df -h / | awk 'NR==2 {print $4}') available"
