import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    this.appService.getPublishedMessages();
  }

  @EventPattern('solana_txn_sig')
  async handleSolanaTransaction(message: string) {
    console.log("The message received from RELAY SERVICE is ", message);
    await this.appService.getSolanaTransactionData(message);
  }

}
