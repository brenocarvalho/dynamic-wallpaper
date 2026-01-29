import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  health(): string {
    return 'OK';
  }

  @Get('generate')
  generateWallpaper(@Res() response: Response): any {
    const buffer = this.appService.generateWallpaper();

    response.setHeader('Content-Type', 'image/png');
    response.setHeader('Content-Length', buffer.length.toString());
    response.setHeader('Cache-Control', 'no-store');

    return response.end(buffer);
  }
}
