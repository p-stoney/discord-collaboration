import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocRepository, DocVersionRepository } from './repositories';
import {
  DocService,
  DocumentStateService,
  PermissionsService,
} from './services';
import { Doc, DocSchema } from './schemas/doc.schema';
import { DocVersion, DocVersionSchema } from './schemas/doc-version.schema';
import { DocController } from './doc.controller';
import { RedisModule } from '../../redis/redis.module';
import { RedisService } from '../../redis/redis.service';

@Module({
  imports: [
    RedisModule,
    MongooseModule.forFeature([{ name: Doc.name, schema: DocSchema }]),
    MongooseModule.forFeature([
      { name: DocVersion.name, schema: DocVersionSchema },
    ]),
  ],
  providers: [
    DocRepository,
    DocVersionRepository,
    DocService,
    PermissionsService,
    DocumentStateService,
    RedisService,
  ],
  controllers: [DocController],
  exports: [
    DocRepository,
    DocVersionRepository,
    DocService,
    PermissionsService,
    DocumentStateService,
  ],
})
export class DocModule {}
