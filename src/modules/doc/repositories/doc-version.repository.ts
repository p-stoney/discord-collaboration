import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocVersion, DocVersionDocument } from '../schemas/doc-version.schema';
import { DocDto } from '../dtos';

@Injectable()
export class DocVersionRepository {
  constructor(
    @InjectModel(DocVersion.name)
    private readonly model: Model<DocVersionDocument>
  ) {}

  async create(docDto: DocDto): Promise<DocVersionDocument> {
    return this.model.create(docDto);
  }

  async findByDocId(docId: string): Promise<DocVersionDocument[]> {
    const versions = await this.model.find({ docId }).exec();
    if (!versions || versions.length === 0) {
      throw new NotFoundException(`No versions found for document ID ${docId}`);
    }
    return versions;
  }
}
