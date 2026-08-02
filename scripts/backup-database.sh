#!/usr/bin/env bash
set -euo pipefail

compose_file="${1:-docker-compose.yml}"
backup_dir="${2:-backups}"

if [[ ! -f "$compose_file" ]]; then
  echo "Arquivo Compose não encontrado: $compose_file" >&2
  exit 1
fi

compose_args=(-f "$compose_file")
if [[ -n "${COMPOSE_ENV_FILE:-}" ]]; then
  if [[ ! -f "$COMPOSE_ENV_FILE" ]]; then
    echo "Arquivo de ambiente não encontrado: $COMPOSE_ENV_FILE" >&2
    exit 1
  fi
  compose_args=(--env-file "$COMPOSE_ENV_FILE" -f "$compose_file")
fi

mkdir -p "$backup_dir"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_file="${backup_dir%/}/hubflow-${timestamp}.dump"

docker compose "${compose_args[@]}" exec -T postgres sh -c \
  'pg_dump --username="$POSTGRES_USER" --dbname="$POSTGRES_DB" --format=custom --no-owner' \
  > "$backup_file"

echo "Backup criado em $backup_file"
