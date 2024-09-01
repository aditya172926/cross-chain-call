import { postVaaSolana } from '@certusone/wormhole-sdk';
import { Injectable } from '@nestjs/common';
import { EventsService } from './events/events.service';

@Injectable()
export class AppService {

  constructor(
    private eventService: EventsService
  ) {
    this.eventService.getPublishedMessages();
  }

  getHello(): string {
    // postVaaSolana()
    return 'Hello World!';
  }
}
