import { Inject, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { SEPOLIA_CONTRACT_ADDRESS, SEPOLIA_RPC_URL } from './constants/constant';
import { SenderContractABI } from './constants/abis/SenderContract.abi';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {

  constructor(
    @Inject('POLLING_SERVICE') private pollingClient: ClientProxy
  ) {}

  provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
  contract = new ethers.Contract(SEPOLIA_CONTRACT_ADDRESS, SenderContractABI, this.provider);

  async getPublishedMessages() {
    console.log("Contract data ", await this.contract.getAddress())
    console.log("Targetted event ", this.contract.getEvent("MessagePublished"));

    // listening to events
    this.contract.on("MessagePublished", (from, to, value, event) => {
      console.log(from, to, value, event);
      if (event) {
        const transactionHash = event.log.transactionHash;
        console.log("Send this transaction log to polling service ", transactionHash);
        this.pollingClient.emit('new_msg', transactionHash);
      }
    });
  }

  getHello(): string {
    return 'Hello World!';
  }
}
