import { ApiProperty } from '@nestjs/swagger';

export class APIHealthStatus {
    @ApiProperty({ example: 'RUNNING', description: 'Status of the API/Foundry service.' })
    status: string;

    @ApiProperty({ example: 'healthy', description: 'Description of status code.' })
    message: string;
}
