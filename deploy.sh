docker buildx build --platform linux/arm64 --load -t verekia/tslfx .
docker save verekia/tslfx | gzip > /tmp/tslfx.tar.gz
scp /tmp/tslfx.tar.gz midgar:/tmp/
ssh midgar docker load --input /tmp/tslfx.tar.gz
ssh midgar docker compose up -d tslfx
