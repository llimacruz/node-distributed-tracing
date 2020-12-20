const { Kafka } = require('kafkajs');
const Chance = require('chance');
const tracingUtil = require("./lib/tracing-util.js");
const kafkaUtil = require("./lib/kafka-util.js");
const chance = new Chance();

const topicName = 't_deliveries';
const tracer = tracingUtil.init("logistics");

(async () => {
  try {
    const kafka = new Kafka({ clientId: 'logistics', brokers: ['localhost:9092'] });
    const consumer = await kafkaUtil.subscribeTopics(kafka, 'logistics', ['t_receipts']);

    await consumer.run({
      eachMessage: async ({ message }) => {
        console.log(`\n*** Processing delivery ***`);

        const deliveryId = chance.integer({ min: 1, max: 1000 });
        const msg = JSON.parse(message.value);
        console.log(`Parent (Receipt) spanId: ${msg.spanData.spanIdStr}`);

        const localSpan = tracingUtil.createSpan(tracer, msg.spanData, 'delivery');
        localSpan.setTag("deliveryId", deliveryId);
        localSpan.finish();
        console.log(`Delivery spanId: ${localSpan.context().spanIdStr}`);

        await kafkaUtil.sendMessage(kafka, topicName, {
          deliveryId,
          spanData: tracingUtil.buildSpanData(localSpan)
        });

        // await kafkaProducer.disconnect()
      },
    });
  } catch (ex) {
    console.error('Error', ex)
  }
})();
