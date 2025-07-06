import { Controller, Patch, Param, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody, ApiTags } from '@nestjs/swagger';
import { UpdateUserLabelDto } from './dto/update-user-label.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  @Patch(':id/label')
  @ApiOperation({ summary: 'Update user label' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserLabelDto })
  @ApiResponse({ status: 200, description: 'User label updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  updateLabel(@Param('id') id: string, @Body() updateUserLabelDto: UpdateUserLabelDto): string {
    return `User ${id} label updated to: ${updateUserLabelDto.label}`;
  }
}
