# =============================================================================
# Acadivo — Terraform Outputs
# =============================================================================

# ── VPC ────────────────────────────────────────────────────────────────────
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "VPC CIDR block"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

# ── RDS ────────────────────────────────────────────────────────────────────
output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.main.endpoint
}

output "rds_database_name" {
  description = "RDS database name"
  value       = aws_db_instance.main.db_name
}

output "rds_username" {
  description = "RDS master username"
  value       = aws_db_instance.main.username
}

# ── Redis ──────────────────────────────────────────────────────────────────
output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_cluster.main.cache_nodes[0].address
}

output "redis_port" {
  description = "ElastiCache Redis port"
  value       = aws_elasticache_cluster.main.cache_nodes[0].port
}

# ── S3 ───────────────────────────────────────────────────────────────────────
output "files_bucket_name" {
  description = "S3 bucket for file storage"
  value       = aws_s3_bucket.files.id
}

output "backups_bucket_name" {
  description = "S3 bucket for backups"
  value       = aws_s3_bucket.backups.id
}

output "files_bucket_arn" {
  description = "S3 files bucket ARN"
  value       = aws_s3_bucket.files.arn
}

# ── ECS ────────────────────────────────────────────────────────────────────
output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

# ── ALB ──────────────────────────────────────────────────────────────────
output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Application Load Balancer hosted zone ID"
  value       = aws_lb.main.zone_id
}

output "alb_arn" {
  description = "Application Load Balancer ARN"
  value       = aws_lb.main.arn
}

# ── Target Groups ──────────────────────────────────────────────────────────
output "api_target_group_arn" {
  description = "API target group ARN"
  value       = aws_lb_target_group.api.arn
}

output "web_target_group_arn" {
  description = "Web target group ARN"
  value       = aws_lb_target_group.web.arn
}

# ── Route53 ────────────────────────────────────────────────────────────────
output "domain_record" {
  description = "Route53 domain record"
  value       = var.domain_name != "" ? aws_route53_record.alb[0].name : null
}

# ── CloudFront ────────────────────────────────────────────────────────────
output "cloudfront_domain" {
  description = "CloudFront distribution domain name"
  value       = var.environment == "production" && var.domain_name != "" ? aws_cloudfront_distribution.main[0].domain_name : null
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = var.environment == "production" && var.domain_name != "" ? aws_cloudfront_distribution.main[0].id : null
}

# ── Security Groups ─────────────────────────────────────────────────────────
output "security_group_alb" {
  description = "ALB security group ID"
  value       = aws_security_group.alb.id
}

output "security_group_ecs" {
  description = "ECS tasks security group ID"
  value       = aws_security_group.ecs_tasks.id
}

output "security_group_rds" {
  description = "RDS security group ID"
  value       = aws_security_group.rds.id
}

output "security_group_redis" {
  description = "Redis security group ID"
  value       = aws_security_group.redis.id
}

# ── Environment Info ───────────────────────────────────────────────────────
output "environment" {
  description = "Deployment environment"
  value       = var.environment
}

output "region" {
  description = "AWS region"
  value       = var.aws_region
}
