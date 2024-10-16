import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Collaborator, CollaboratorSchema } from './collaborator.schema';

@Schema({ timestamps: true })
export class DocVersion {
  @Prop({ type: String, required: true, unique: true })
  docId: string;

  @Prop({
    type: String,
    required: true,
    ref: 'User',
    minLength: 17,
    maxLength: 19,
  })
  ownerId: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Number, required: true, default: 1 })
  revision: number;

  @Prop({ type: [CollaboratorSchema], default: [] })
  collaborators: Collaborator[];
}

export type DocVersionDocument = HydratedDocument<DocVersion>;
export const DocVersionSchema = SchemaFactory.createForClass(DocVersion);
