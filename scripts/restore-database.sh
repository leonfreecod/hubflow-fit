#!/usr/bin/env bash
set -euo pipefail

backup_file="${1:-}"
compose_file="${2:-docker-compose.yml}"
confirmation="${3:-}"

if [[ -z "$backup_file" || "$confirmation" != "--confirm" ]]; then
  echo "Uso: $0 <arquivo.dump> [docker-compose.yml] --confirm" >&2
  echo "A restauração substitui o conteúdo atual do banco." >&2
  exit 1
fi

if [[ ! -f "$backup_file" ]]; then
  echo "Backup não encontrado: $backup_file" >&2
  exit 1
fi

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

docker compose "${compose_args[@]}" stop backend frontend
docker compose "${compose_args[@]}" exec -T postgres sh -c \
  'pg_restore --username="$POSTGRES_USER" --dbname="$POSTGRES_DB" --clean --if-exists --no-owner --exit-on-error' \
  < "$backup_file"
docker compose "${compose_args[@]}" start backend frontend

echo "Backup restaurado: $backup_file"
