### To locally test the typesense indexer

From the same folder run:

1. Build your container from the root folder: `docker build -t typesense-indexer-image -f typesenseIndexer.Dockerfile .`
2. Run your container: `docker run typesense-indexer-image`.
