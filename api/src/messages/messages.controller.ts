import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  @Get('search')
  @ApiOperation({ summary: 'Search messages' })
  @ApiQuery({
    name: 'query',
    required: false,
    type: String,
    description: 'Search query string',
  })
  @ApiResponse({ status: 200, description: 'Return search results.' })
  searchMessages(@Query('query') query: string): string[] {
    return [`Searching messages for: ${query || 'all messages'}`];
  }
}
