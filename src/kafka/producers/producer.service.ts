import { Injectable, OnApplicationShutdown, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { KafkaProducer } from "../kafka.producer";
import { Kafka, Message, Admin } from "kafkajs";
import { IProducer } from "../interfaces/producer.interface";

@Injectable()
export class ProducerService implements OnApplicationShutdown {
  private readonly producers = new Map<string, IProducer>();
  private readonly logger = new Logger(ProducerService.name);
  private admin: Admin | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getBrokerUrl(): string {
    const broker = this.configService.get<string>("KAFKA_BROKER");
    if (!broker) {
      throw new Error("KAFKA_BROKER is not defined in configuration");
    }
    return broker;
  }

  private async getAdmin() {
    if (!this.admin) {
      const broker = this.getBrokerUrl();
      const kafka = new Kafka({ brokers: [broker] });
      this.admin = kafka.admin();
      await this.admin.connect();
    }
    return this.admin;
  }

  async produce(topic: string, message: Message) {
    const producer = await this.getProducer(topic);
    await producer.produce(message);
  }

  async produceBatch(topic: string, messages: Message[]) {
    const producer = await this.getProducer(topic);
    await (producer as any).produce(messages);
  }

  private async ensureTopic(topic: string) {
    try {
      const admin = await this.getAdmin();
      const retentionMs =
        this.configService.get<string>("KAFKA_RETENTION_MS") || "604800000";

      await admin.createTopics({
        topics: [
          {
            topic,
            numPartitions: 3,
            configEntries: [{ name: "retention.ms", value: retentionMs }],
          },
        ],
        waitForLeaders: true,
      });
      this.logger.log(`Topic ensured: ${topic}`);
    } catch (err: any) {
      if (!err?.type?.includes("TOPIC_ALREADY_EXISTS")) {
        this.logger.error(`Failed to ensure topic ${topic}`, err);
      }
    }
  }

  private async getProducer(topic: string) {
    let producer = this.producers.get(topic);
    if (!producer) {
      const broker = this.getBrokerUrl();

      await this.ensureTopic(topic);

      const kafkaProducer = new KafkaProducer(topic, broker);
      await kafkaProducer.connect();

      producer = kafkaProducer;
      this.producers.set(topic, producer);
      this.logger.log(`Producer connected for topic ${topic} (Broker: ${broker})`);
    }
    return producer;
  }

  async onApplicationShutdown() {
    for (const producer of this.producers.values()) {
      await producer.disconnect();
    }
    if (this.admin) {
      await this.admin.disconnect();
    }
  }
}