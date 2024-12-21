docker buildx build --platform linux/arm64 --load -t verekia/tslfx .
docker save -o /tmp/tslfx.tar verekia/tslfx
scp /tmp/tslfx.tar midgar:/tmp/
ssh midgar docker load --input /tmp/tslfx.tar
ssh midgar docker compose up -d tslfx
