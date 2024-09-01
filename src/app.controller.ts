import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    this.appService.getPublishedMessages();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
