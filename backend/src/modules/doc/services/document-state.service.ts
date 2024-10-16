import { Injectable } from '@nestjs/common';
import { DocService } from './doc.service';
import { debounce } from 'ts-debounce';

// SearchStringTroubleshoot.
// This is a major WIP. Interface is not practical for now. Likely prefer centralized cache manager.

interface DocumentCacheEntry {
  content: string;
  lastEdited: Date;
  lastSavedContent?: string;
}

@Injectable()
export class DocumentStateService {
  private documentCache = new Map<string, DocumentCacheEntry>();

  constructor(private readonly docService: DocService) {}

  getDocumentState(docId: string): DocumentCacheEntry | undefined {
    return this.documentCache.get(docId);
  }

  updateDocumentState(docId: string, newContent: string) {
    this.updateCacheState(docId, newContent);
  }

  updateCacheState = debounce(
    (docId: string, content: string) => {
      const now = new Date();
      const currentState = this.documentCache.get(docId);
      this.documentCache.set(docId, {
        content,
        lastEdited: now,
        lastSavedContent: currentState?.lastSavedContent,
      });
    },
    3000,
    { isImmediate: false }
  );

  saveDocumentState(docId: string) {
    const currentState = this.documentCache.get(docId);
    if (
      currentState &&
      currentState.content !== currentState.lastSavedContent
    ) {
      this.docService.update({
        docId,
        updatedDetails: { content: currentState.content },
      });

      this.documentCache.set(docId, {
        ...currentState,
        lastSavedContent: currentState.content,
      });
    }
  }

  saveToDatabase = debounce(
    (docId: string) => {
      this.saveDocumentState(docId);
    },
    300000,
    { isImmediate: false }
  );

  cleanUpCache() {
    const now = Date.now();
    this.documentCache.forEach((entry, docId) => {
      if (now - entry.lastEdited.getTime() > 30 * 60 * 1000) {
        this.documentCache.delete(docId);
      }
    });
  }
}
