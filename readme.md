# POC - Distributed Tracing for microservices Kafka based communication using Jaeger


## Set up the environment

### Kafka
I did this POC using Zookeeper and Kafka running on my machine. It's possible do it following the steps 1 and 2 in this tutorial: https://kafka.apache.org/quickstart
To wrap up, after Kafka download, run:

```
bin/zookeeper-server-start.sh config/zookeeper.properties
bin/kafka-server-start.sh config/server.properties
```


### Jaeger
It's easy deploy Jaeger for study using Docker:

```
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HTTP_PORT=9411 \
  -p 5775:5775/udp \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 14268:14268 \
  -p 14250:14250 \
  -p 9411:9411 \
  jaegertracing/all-in-one:1.21
```
And access de Jaeger User Interface here at http://localhost:16686/search


## Disclaimer

This is an experiment using jaeger-client package to achieve Distributed Tracing in a microservices architecture that uses Kafka to stablish asynchonous communication.
The way that jaeger and kafka components are initialized here are not recomended to production environment.
