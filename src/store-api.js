const { Kafka } = require('kafkajs');
const Chance = require('chance');
const tracingUtil = require("./lib/tracing-util.js");
const kafkaUtil = require("./lib/kafka-util.js");
const chance = new Chance();

const topicName = 't_orders';
const tracer = tracingUtil.init("store");

const createOrder = async () => {
  try {
    console.log(`\n*** Processing order ***`);

    const orderId = chance.integer({ min: 1, max: 1000 });
    const orderValue = chance.floating({ min: 1, max: 1000, fixed: 2 })

    const localSpan = tracer.startSpan("order");
    localSpan.setTag("orderId", orderId);
    localSpan.setTag("orderValue", orderValue);
    localSpan.finish();
    console.log('Order spanId:', localSpan.context().spanIdStr)

    const kafka = new Kafka({ clientId: 'store', brokers: ['localhost:9092'] });
    const producer = await kafkaUtil.sendMessage(kafka, topicName, {
      orderId,
      spanData: tracingUtil.buildSpanData(localSpan)
    });
    await kafkaUtil.disconnect(producer);
    tracer.close(() => process.exit());
  } catch (ex) {
    console.error('Error', ex)
  }
};

createOrder();
