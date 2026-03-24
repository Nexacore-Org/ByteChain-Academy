import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class ReorderLessonsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  orderedIds: string[];
}
