import { Injectable } from '@nestjs/common';
import { DocService } from './doc.service';
import { RedisService } from '../../../redis/redis.service';
import { debounce } from 'ts-debounce';

@Injectable()
export class DocumentStateService {
  constructor(
    private readonly docService: DocService,
    private readonly redisService: RedisService
  ) {
    this.updateDocumentState = debounce(
      this.updateDocumentState.bind(this),
      1000
    );
    this.saveToDatabase = debounce(this.saveToDatabase.bind(this), 5000);
  }

  async getDocumentState(docId: string): Promise<string | null> {
    const client = this.redisService.getClient();
    const content = await client.get(`document:${docId}`);
    return content;
  }

  updateDocumentState(docId: string, newContent: string) {
    console.log('Updating document state in Redis:', { docId, newContent });
    const client = this.redisService.getClient();
    return client.set(`document:${docId}`, newContent);
  }

  saveToDatabase(docId: string) {
    console.log('Saving document to database:', docId);
    const client = this.redisService.getClient();
    return client.get(`document:${docId}`).then((content) => {
      if (content) {
        return this.docService.update({
          docId,
          updatedDetails: { content },
        });
      } else {
        console.log('No content found in Redis for docId:', docId);
      }
    });
  }
}
