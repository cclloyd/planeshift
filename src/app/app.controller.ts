import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { AppService } from './app.service.js';
import { APIHealthStatus } from './dto/health.dto.js';
import { ApiOkResponse, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
    constructor(private readonly app: AppService) {}

    @Get('static/:filePath')
    @ApiOperation({ summary: 'Static assets' })
    @ApiParam({ name: 'filePath', description: 'Relative path to the file from `src/resources/`', required: true })
    @ApiResponse({ status: 200, description: 'The requested file.' })
    // NOTE: at runtime ServeStaticModule takes this request, and only falls back to this when the file doesn't exist.
    serve(@Param('filePath') filePath: string, @Res() res: Response) {
        throw new NotFoundException('File not found');
    }

    @Get('/healthz')
    @ApiOperation({ summary: 'API Healthcheck service endpoint', description: 'Provides a healthcheck for the API.' })
    @ApiOkResponse({ description: 'A healthcheck response indicating the health of the API.', type: APIHealthStatus })
    getHealthStatus() {
        return this.app.getHealth();
    }
}
