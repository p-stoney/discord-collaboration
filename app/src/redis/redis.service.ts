import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({ url: 'redis://localhost:6379' });
    this.client.connect();
  }

  getClient(): RedisClientType {
    return this.client;
  }
}
