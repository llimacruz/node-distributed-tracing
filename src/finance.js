const { Kafka } = require('kafkajs');
const Chance = require('chance');
const tracingUtil = require("./lib/tracing-util.js");
const kafkaUtil = require("./lib/kafka-util.js");
const chance = new Chance();

const topicName = 'receipts';
const tracer = tracingUtil.init("finance");

(async () => {
  try {
    // initialize Kafka consumer
    const kafka = new Kafka({ clientId: 'finance', brokers: ['localhost:9092'] });
    const consumer = await kafkaUtil.subscribeTopics(kafka, 'finance', ['orders-1']);

    await consumer.run({
      eachMessage: async ({ message }) => {
        // each message received from kafka will be handled here
        console.log(`\n*** Processing receipt ***`);

        const receiptId = chance.integer({ min: 1, max: 1000 });
        const msg = JSON.parse(message.value);
        console.log(`Parent (Order) spanId: ${msg.spanData.spanIdStr}`);

        const localSpan = tracingUtil.createSpan(tracer, msg.spanData, 'receipt');
        localSpan.setTag("receiptId", receiptId);
        localSpan.finish();
        console.log(`Receipt spanId: ${localSpan.context().spanIdStr}`);

        await kafkaUtil.sendMessage(kafka, topicName, {
          receiptId,
          spanData: tracingUtil.buildSpanData(localSpan)
        });
      },
    });
  } catch (ex) {
    console.error('Error', ex)
  }
})();
