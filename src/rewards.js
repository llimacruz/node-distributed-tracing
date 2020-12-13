const { Kafka } = require('kafkajs');
const Chance = require('chance');
const tracingUtil = require("./lib/tracing-util.js");
const kafkaUtil = require("./lib/kafka-util.js");
const chance = new Chance();

const tracer = tracingUtil.init("rewards");

(async () => {
  try {
    const kafka = new Kafka({ clientId: 'rewards', brokers: ['localhost:9092'] });
    const consumer = await kafkaUtil.subscribeTopics(kafka, 'rewards', ['deliveries']);

    await consumer.run({
      eachMessage: async ({ message }) => {
        console.log(`\n*** Processing reward ***`);

        const rewardId = chance.integer({ min: 1, max: 1000 });
        const msg = JSON.parse(message.value);
        console.log(`Parent (Delivery) spanId: ${msg.spanData.spanIdStr}`);

        const localSpan = tracingUtil.createSpan(tracer, msg.spanData, 'reward');
        localSpan.setTag("rewardId", rewardId);
        localSpan.finish();
        console.log(`Reward spanId: ${localSpan.context().spanIdStr}`);
      },
    });
  } catch (ex) {
    console.error('Error', ex)
  }
})();
