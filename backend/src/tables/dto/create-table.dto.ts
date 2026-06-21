import { IsNumber, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TableStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateTableDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  tableNumber: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  seats: number;

  @ApiPropertyOptional({ enum: TableStatus })
  @IsEnum(TableStatus)
  @IsOptional()
  status?: TableStatus;

  @ApiProperty()
  @IsString()
  floorId: string;
}
