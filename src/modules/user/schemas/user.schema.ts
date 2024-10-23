import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: String,
    required: true,
    unique: true,
    minLength: 17,
    maxLength: 19,
  })
  discordId: string;

  @Prop({ type: String, required: true, minLength: 2, maxLength: 32 })
  username: string;

  @Prop({ type: String, required: true, length: 4 })
  discriminator: string;

  @Prop({ type: String, default: null })
  avatar: string | null;

  @Prop({ type: String })
  email?: string;

  @Prop({ type: String, required: true })
  accessToken: string;

  @Prop({ type: String, required: true })
  refreshToken: string;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
