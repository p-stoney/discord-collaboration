import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Doc, DocDocument } from '../schemas/doc.schema';

@Injectable()
export class DocRepository {
  constructor(
    @InjectModel(Doc.name)
    private readonly model: Model<DocDocument>
  ) {}
  async findByDocId(docId: string): Promise<DocDocument | null> {
    return this.model.findOne({ docId }).exec();
  }

  async findAllByOwner(ownerId: string): Promise<DocDocument[]> {
    return this.model.find({ ownerId }).exec();
  }

  async findAllByCollaborator(discordId: string): Promise<DocDocument[]> {
    return this.model.find({ 'collaborators.discordId': discordId }).exec();
  }

  async create(docData: Partial<Doc>): Promise<DocDocument> {
    return this.model.create(docData);
  }

  async update(
    docId: string,
    updatedDetails: Partial<Doc>
  ): Promise<DocDocument | null> {
    return this.model
      .findOneAndUpdate({ docId }, updatedDetails, { new: true })
      .exec();
  }
}
