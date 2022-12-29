const { BatchConsumer } =  require("@tabdigital/kafka-tcp-client");
const os = require("os");

const get = require("../../config");
const log = require("../../log");

const hostname = os.hostname().split(".")[0];
const cfg = get();
const { brokerList, schemaRegistry } = cfg.kafka;

module.exports = class VenueConsumer {
  constructor(
    consumerConfig,
    batchMessageHandler,
    useSchemaRegistry = true,
    overrides
  ) {
    const {
      clientIdPrefix,
      groupId,
      batchSize,
      maxParallelHandles,
      pollingIntervalInMs,
      commitIntervalInMs,
      topic,
    } = consumerConfig;
    const consumerGlobalConfig = Object.assign({ "client.id": `${clientIdPrefix}-${hostname}`, "metadata.broker.list": brokerList, "group.id": groupId, "enable.auto.commit": false }, overrides === null || overrides === void 0 ? void 0 : overrides.consumerGlobalConfig);
    const consumerTopicConfig = Object.assign({ "auto.offset.reset": "latest", "enable.auto.commit": false }, overrides === null || overrides === void 0 ? void 0 : overrides.consumerTopicConfig);
    
    this.consumer = new BatchConsumer({
      consumerGlobalConfig,
      consumerTopicConfig,
      batchSize,
      maxParallelHandles,
      pollingIntervalInMs,
      commitIntervalInMs,
      batchMessageHandler,
      log,
    });
    this.topic = topic;
    this.schemaRegistry = useSchemaRegistry ? schemaRegistry : undefined;
  }

  start() {
    this.consumer.start(this.topic, this.schemaRegistry);
  }

  stop() {
    this.consumer.stop();
  }

  get isStarted() {
    return this.consumer.isStarted();
  }
}
