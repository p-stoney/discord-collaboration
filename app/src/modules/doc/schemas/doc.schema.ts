import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Collaborator, CollaboratorSchema } from './collaborator.schema';

@Schema({ timestamps: true })
export class Doc {
  @Prop({ type: String, required: true })
  docId: string;

  @Prop({
    type: String,
    required: true,
    ref: 'User',
    minLength: 17,
    maxLength: 19,
  })
  ownerId: string;

  @Prop({ type: String, default: 'New Document' })
  title: string;

  @Prop({ type: String, default: '' })
  content: string;

  @Prop({ type: Number, required: true, default: 1 })
  revision: number;

  @Prop({ type: [CollaboratorSchema], default: [] })
  collaborators: Collaborator[];
}

export type DocDocument = HydratedDocument<Doc>;
export const DocSchema = SchemaFactory.createForClass(Doc);
