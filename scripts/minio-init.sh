#!/bin/sh
set -e

# Wait for MinIO to be ready
until mc ready local; do
    echo "Waiting for MinIO to be ready..."
    sleep 1
done

# Set up mc alias
mc alias set myminio http://localhost:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}

# Create buckets if they don't exist
mc mb myminio/register --ignore-existing
mc mb myminio/profile --ignore-existing
mc mb myminio/resume --ignore-existing

# Make buckets public
mc anonymous set public myminio/register
mc anonymous set public myminio/profile
mc anonymous set public myminio/resume

echo "MinIO buckets initialized and made public" 