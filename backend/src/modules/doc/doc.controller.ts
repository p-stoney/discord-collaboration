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
import { AuthenticatedRequest } from '../auth/interfaces/authenticated.interface';

/**
 * Controller that handles document-related operations such as retrieval, creation, updating, and managing collaborators.
 * Enforces authentication and permission checks using guards and custom decorators.
 */
@Controller('documents')
@UseGuards(AuthenticatedGuard, PermissionGuard)
export class DocController {
  constructor(private readonly docService: DocService) {}

  /**
   * Retrieves a document by its ID.
   * Requires the user to have read permission on the document.
   * @param docId - The unique identifier of the document.
   * @returns The document data transfer object.
   */
  @Get(':docId')
  @RequireReadPermission()
  async getDocument(@Param('docId') docId: string): Promise<DocDto> {
    return this.docService.findByDocId(docId);
  }

  /**
   * Retrieves all documents owned by the authenticated user.
   * @param req - The authenticated request containing the user information.
   * @returns An array of document DTOs owned by the user.
   */
  @Get('owned')
  @RequireAdminPermission()
  async getOwnedDocuments(@Req() req: AuthenticatedRequest): Promise<DocDto[]> {
    const user = req.user as UserDocument;
    return this.docService.findAllByOwner(user.discordId);
  }

  /**
   * Retrieves all documents where the authenticated user is a collaborator.
   * @param req - The authenticated request containing the user information.
   * @returns An array of document DTOs where the user is a collaborator.
   */
  @Get('collaborations')
  @RequireReadPermission()
  async getCollaboratedDocuments(
    @Req() req: AuthenticatedRequest
  ): Promise<DocDto[]> {
    const user = req.user;
    return this.docService.findAllByCollaborator(user.discordId);
  }

  /**
   * Creates a new document with the authenticated user as the owner.
   * @param req - The authenticated request containing the user information.
   * @param createDocDto - The data transfer object containing the document details.
   * @returns The created document DTO.
   */
  @Post()
  async createDocument(
    @Req() req: AuthenticatedRequest,
    @Body() createDocDto: CreateDocDto
  ): Promise<DocDto> {
    const user = req.user;
    createDocDto.ownerId = user.discordId;
    return this.docService.create(createDocDto);
  }

  /**
   * Updates an existing document.
   * Requires the user to have write permission on the document.
   * @param docId - The unique identifier of the document to update.
   * @param updateDocDto - The data transfer object containing updated document details.
   * @returns The updated document DTO.
   */
  @Put(':docId')
  @RequireWritePermission()
  async updateDocument(
    @Param('docId') docId: string,
    @Body() updateDocDto: UpdateDocDto
  ): Promise<DocDto> {
    updateDocDto.docId = docId;
    return this.docService.update(updateDocDto);
  }

  /**
   * Adds collaborators to a document or updates their permissions.
   * Requires the user to have admin permission on the document.
   * @param docId - The unique identifier of the document.
   * @param addCollaboratorsDto - The data transfer object containing collaborator information.
   * @returns The updated document DTO.
   */
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
