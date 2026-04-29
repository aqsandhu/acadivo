# =============================================================================
# Acadivo — Terraform Variables
# =============================================================================

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "ap-south-1"  # Mumbai — closest to Pakistan
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# ── Database ────────────────────────────────────────────────────────────────
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "RDS max autoscaling storage in GB"
  type        = number
  default     = 100
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "acadivo"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "acadivo_admin"
  sensitive   = true
}

variable "db_password" {
  description = "PostgreSQL master password"
  type        = string
  sensitive   = true
}

# ── Redis ───────────────────────────────────────────────────────────────────
variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

# ── Domain & SSL ──────────────────────────────────────────────────────────
variable "domain_name" {
  description = "Primary domain name (e.g., acadivo.com)"
  type        = string
  default     = ""
}

variable "acm_certificate_arn" {
  description = "ARN of ACM certificate for HTTPS"
  type        = string
  default     = ""
}

# ── Container Images ───────────────────────────────────────────────────────
variable "api_image" {
  description = "API container image URI"
  type        = string
  default     = "ghcr.io/acadivo/acadivo-api:latest"
}

variable "web_image" {
  description = "Web container image URI"
  type        = string
  default     = "ghcr.io/acadivo/acadivo-web:latest"
}

variable "socket_image" {
  description = "Socket container image URI"
  type        = string
  default     = "ghcr.io/acadivo/acadivo-socket:latest"
}

# ── Scaling ─────────────────────────────────────────────────────────────────
variable "api_desired_count" {
  description = "Desired number of API tasks"
  type        = number
  default     = 2
}

variable "web_desired_count" {
  description = "Desired number of Web tasks"
  type        = number
  default     = 2
}

variable "socket_desired_count" {
  description = "Desired number of Socket tasks"
  type        = number
  default     = 2
}

# ── Tags ────────────────────────────────────────────────────────────────────
variable "tags" {
  description = "Additional tags for all resources"
  type        = map(string)
  default     = {}
}
