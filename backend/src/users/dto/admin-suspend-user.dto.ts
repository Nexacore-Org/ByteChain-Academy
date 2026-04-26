import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class AdminSuspendUserDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  suspended: boolean;
}
