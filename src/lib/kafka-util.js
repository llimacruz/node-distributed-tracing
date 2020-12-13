const sendMessage = async (kafka, topicName, message) => {
  const kafkaProducer = kafka.producer();
  await kafkaProducer.connect();
  await kafkaProducer.send({
    topic: topicName,
    messages: [{
      value: JSON.stringify(message)
    }],
  });
  console.log(`Event sent to topic "${topicName}".`);
  return kafkaProducer;
};

const subscribeTopics = async (kafka, groupId, topics) => {
  const consumer = kafka.consumer({ groupId })
  await consumer.connect()

  const subscribeList = topics.map(topic => {
    return consumer.subscribe({ topic, fromBeginning: true })
  })
  await Promise.all(subscribeList);

  return consumer;
}

const disconnect = async producer => {
  await producer.disconnect();
}

module.exports = {
  subscribeTopics,
  sendMessage,
  disconnect
}
