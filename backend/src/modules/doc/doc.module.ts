import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocRepository } from './repositories/doc.repository';
import { DocVersionRepository } from './repositories/doc-version.repository';
import { DocService } from './services/doc.service';
import { DocumentStateService } from './services/document-state.service';
import { Doc, DocSchema } from './schemas/doc.schema';
import { DocVersion, DocVersionSchema } from './schemas/doc-version.schema';
import { PermissionsService } from './services/permissions.service';
import { DocController } from './doc.controller';

@Module({
  imports: [
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
