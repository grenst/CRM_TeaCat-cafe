import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserLabelDto {
  @ApiProperty({ description: 'The new label for the user' })
  @IsString()
  @IsNotEmpty()
  label: string;
}
