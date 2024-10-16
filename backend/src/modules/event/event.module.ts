import { Module } from '@nestjs/common';
import { DocModule } from '../doc/doc.module';
import { UserModule } from '../user/user.module';
import { EventGateway } from './event.gateway';

@Module({
  imports: [DocModule, UserModule],
  providers: [EventGateway],
})
export class EventModule {}
