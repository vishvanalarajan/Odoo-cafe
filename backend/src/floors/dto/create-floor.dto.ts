import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFloorDto {
  @ApiProperty()
  @IsString()
  name: string;
}
