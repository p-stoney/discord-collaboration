import { SetMetadata } from '@nestjs/common';
import { DocumentPermission } from '../enums/doc-permission.enum';

export const PERMISSION_KEY = 'requiredPermission';

/**
 * Sets the required document permission metadata for the handler.
 * @param permission - The required `DocumentPermission`.
 */
export const RequireReadPermission = () =>
  SetMetadata(PERMISSION_KEY, DocumentPermission.READ);

export const RequireWritePermission = () =>
  SetMetadata(PERMISSION_KEY, DocumentPermission.WRITE);

export const RequireAdminPermission = () =>
  SetMetadata(PERMISSION_KEY, DocumentPermission.ADMIN);
