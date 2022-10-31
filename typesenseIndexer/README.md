### To locally test the typesense indexer

From the same folder run:

1. Build your container from the root folder: `docker build -t gcr.io/visualexp-a7d2c/typesense-indexer -f typesenseIndexer.Dockerfile .`
2. Run your container: `docker run typesense-indexer-image`.

### For Production

1. To build docker image run: `docker build -t gcr.io/visualexp-a7d2c/typesense-indexer:latest -f typesenseIndexer.Dockerfile .`
2. To push docker image: `docker push gcr.io/visualexp-a7d2c/typesense-indexer:latest`
