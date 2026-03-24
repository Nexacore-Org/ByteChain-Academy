import { Global, Module } from '@nestjs/common';
import { PaginationService } from './services/pagination.service';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  providers: [PaginationService, RolesGuard],
  exports: [PaginationService, RolesGuard],
})
export class CommonModule {}

export { UserRole } from './enums/user-role.enum';
export { RolesGuard } from './guards/roles.guard';
export { Roles } from './decorators/roles.decorator';
