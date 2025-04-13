import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { Roles } from 'src/roles/roles.decorator';
import { UserRole } from 'src/roles/roles.enum';
import { TutorService } from './services/tutor.service';

@Controller('tutor')
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TUTOR)
  create(@Body() createTutorDto: CreateTutorDto) {
    return this.tutorService.create(createTutorDto);
  }

  @Get()
  @Roles(UserRole.TUTOR, UserRole.ADMIN)
  findAll() {
    return this.tutorService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TUTOR, UserRole.STUDENT)
  findOne(@Param('id') id: string) {
    return this.tutorService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.TUTOR, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateTutorDto: UpdateTutorDto) {
    return this.tutorService.update(id, updateTutorDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.tutorService.delete(id);
  }
}
