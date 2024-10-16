import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
  Post,
  Body,
  Put,
} from '@nestjs/common';
import { DocService } from './services/doc.service';
import { AuthenticatedGuard } from '../auth/guards';
import { PermissionGuard } from './guards';
import {
  RequireReadPermission,
  RequireWritePermission,
  RequireAdminPermission,
} from './decorators/permission.decorator';
import {
  DocDto,
  CreateDocDto,
  UpdateDocDto,
  AddCollaboratorsDto,
} from './dtos';
import { UserDocument } from '../user/schemas/user.schema';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('documents')
@UseGuards(AuthenticatedGuard, PermissionGuard)
export class DocController {
  constructor(private readonly docService: DocService) {}

  @Get(':docId')
  @RequireReadPermission()
  async getDocument(@Param('docId') docId: string): Promise<DocDto> {
    return this.docService.findByDocId(docId);
  }

  @Get('owned')
  @RequireAdminPermission()
  async getOwnedDocuments(@Req() req: AuthenticatedRequest): Promise<DocDto[]> {
    const user = req.user as UserDocument;
    return this.docService.findAllByOwner(user.discordId);
  }

  @Get('collaborations')
  @RequireReadPermission()
  async getCollaboratedDocuments(
    @Req() req: AuthenticatedRequest
  ): Promise<DocDto[]> {
    const user = req.user;
    return this.docService.findAllByCollaborator(user.discordId);
  }

  @Post()
  async createDocument(
    @Req() req: AuthenticatedRequest,
    @Body() createDocDto: CreateDocDto
  ): Promise<DocDto> {
    const user = req.user;
    createDocDto.ownerId = user.discordId;
    return this.docService.create(createDocDto);
  }

  @Put(':docId')
  @RequireWritePermission()
  async updateDocument(
    @Param('docId') docId: string,
    @Body() updateDocDto: UpdateDocDto
  ): Promise<DocDto> {
    updateDocDto.docId = docId;
    return this.docService.update(updateDocDto);
  }

  @Post(':docId/collaborators')
  @RequireAdminPermission()
  async addCollaborators(
    @Param('docId') docId: string,
    @Body() addCollaboratorsDto: AddCollaboratorsDto
  ): Promise<DocDto> {
    addCollaboratorsDto.docId = docId;
    return this.docService.addCollaborators(addCollaboratorsDto);
  }
}
