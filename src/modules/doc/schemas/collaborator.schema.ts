import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { DocumentPermission } from '../enums/doc-permission.enum';

@Schema({ timestamps: true })
export class Collaborator {
  @Prop({
    type: String,
    required: true,
    ref: 'User',
    minLength: 17,
    maxLength: 19,
  })
  discordId: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(DocumentPermission),
  })
  permission: DocumentPermission;
}

export const CollaboratorSchema = SchemaFactory.createForClass(Collaborator);
