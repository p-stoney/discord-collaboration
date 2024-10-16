import { DocDocument } from '../schemas/doc.schema';
import { DocVersionDocument } from '../schemas/doc-version.schema';
import { Collaborator } from '../schemas/collaborator.schema';
import { DocumentPermission } from '../enums/doc-permission.enum';
import { UserDocument } from '../../user/schemas/user.schema';
import { ExecutionContext } from '@nestjs/common';

export const mockCollaborators: Collaborator[] = [
  {
    discordId: '22222222222222222',
    permission: DocumentPermission.WRITE,
  },
  {
    discordId: '33333333333333333',
    permission: DocumentPermission.READ,
  },
];

export const mockDocs: DocDocument[] = [
  {
    docId: 'doc123',
    ownerId: '11111111111111111',
    title: 'Test Document 1',
    content: 'This is a test document.',
    revision: 1,
    collaborators: mockCollaborators,
  },
  {
    docId: 'doc456',
    ownerId: '11111111111111111',
    title: 'Test Document 2',
    content: 'This is another test document.',
    revision: 2,
    collaborators: [],
  },
] as DocDocument[];

export const mockDocModel = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
};

export const mockDocVersions: DocVersionDocument[] = [
  {
    docId: 'doc123',
    ownerId: '11111111111111111',
    title: 'Test Document Version 1',
    content: 'This is the first version of the test document.',
    revision: 1,
    collaborators: mockCollaborators,
  },
  {
    docId: 'doc123',
    ownerId: '11111111111111111',
    title: 'Test Document Version 2',
    content: 'This is the second version of the test document.',
    revision: 2,
    collaborators: mockCollaborators,
  },
] as DocVersionDocument[];

export const mockDocService = {
  findByDocId: jest.fn(),
  findAllByOwner: jest.fn(),
  findAllByCollaborator: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  addCollaborators: jest.fn(),
};

export const mockUser: UserDocument = {
  discordId: '11111111111111111',
  username: 'TestUser',
  discriminator: '1234',
  avatar: null,
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
} as UserDocument;

export class MockAuthenticatedGuard {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request.user = mockUser;
    return true;
  }
}

export class MockPermissionGuard {
  canActivate() {
    return true;
  }
}
