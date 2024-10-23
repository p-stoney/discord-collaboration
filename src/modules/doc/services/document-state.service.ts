import { Injectable } from '@nestjs/common';
import { DocService } from './doc.service';
import { RedisService } from '../../../redis/redis.service';
import { debounce } from 'ts-debounce';

/**
 * Service responsible for managing the real-time state of documents.
 * It synchronizes document content between Redis (for fast access) and the database.
 */
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

  /**
   * Retrieves the current state of a document from Redis.
   * @param docId - The unique identifier of the document.
   * @returns The content of the document or null if not found.
   */
  async getDocumentState(docId: string): Promise<string | null> {
    const client = this.redisService.getClient();
    const content = await client.get(`document:${docId}`);
    return content;
  }

  /**
   * Updates the document state in Redis.
   * Debounced to prevent excessive writes.
   * @param docId - The unique identifier of the document.
   * @param newContent - The new content of the document.
   */
  updateDocumentState(docId: string, newContent: string) {
    console.log('Updating document state in Redis:', { docId, newContent });
    const client = this.redisService.getClient();
    return client.set(`document:${docId}`, newContent);
  }

  /**
   * Saves the current state of the document from Redis to the database.
   * Debounced to batch save operations.
   * @param docId - The unique identifier of the document.
   */
  async saveToDatabase(docId: string): Promise<void> {
    console.log('Saving document to database:', docId);
    const client = this.redisService.getClient();

    try {
      const content = await client.get(`document:${docId}`);

      if (content) {
        await this.docService.update({
          docId,
          updatedDetails: { content },
        });
      } else {
        console.log('No content found in Redis for docId:', docId);
      }
    } catch (error) {
      console.error(
        `Failed to save document with docId: ${docId} to database`,
        error
      );
    }
  }
}
