const { Kafka } = require('kafkajs');
const Chance = require('chance');
const tracingUtil = require("./lib/tracing-util.js");
const kafkaUtil = require("./lib/kafka-util.js");
const chance = new Chance();

const topicName = 't_emails';
const tracer = tracingUtil.init("mailer");

(async () => {
  try {
    const kafka = new Kafka({ clientId: 'mailer', brokers: ['localhost:9092'] });
    const consumer = await kafkaUtil.subscribeTopics(kafka, 'mailer', ['t_receipts', 't_deliveries']);

    await consumer.run({
      eachMessage: async ({ message, topic }) => {
        console.log(`\n*** Processing e-mail ***`);

        const emailId = chance.integer({ min: 1, max: 1000 });
        const msg = JSON.parse(message.value);
        console.log(`Parent (${topic === 't_receipts' ? 'Receipt' : 'Delivery'}) spanId: ${msg.spanData.spanIdStr}`);

        const localSpan = tracingUtil.createSpan(tracer, msg.spanData, 'email');
        localSpan.setTag("emailId", emailId);
        localSpan.finish();
        console.log(`Email spanId: ${localSpan.context().spanIdStr}`);

        await kafkaUtil.sendMessage(kafka, topicName, {
          emailId,
          spanData: tracingUtil.buildSpanData(localSpan)
        });
        // await kafkaProducer.disconnect()
      },
    });
  } catch (ex) {
    console.error('Error', ex)
  }
})();
