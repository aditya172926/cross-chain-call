import { Inject, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { ALCHEMY_SOLANA_API, SEPOLIA_CONTRACT_ADDRESS, SEPOLIA_RPC_URL } from './constants/constant';
import { SenderContractABI } from './constants/abis/SenderContract.abi';
import { ClientProxy } from '@nestjs/microservices';
import { TransactionStatus } from './interfaces/types';

@Injectable()
export class AppService {

  constructor(
    @Inject('POLLING_SERVICE') private pollingClient: ClientProxy,
    @Inject('DATABASE_SERVICE') private dbClient: ClientProxy

  ) { }

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
        const msgPayload = {
          sourceTransactionHash: transactionHash,
          createdAt: Date.now().toString(),
          updatedAt: Date.now().toString(),
          status: TransactionStatus.PENDING,
          destinationTransactionHash: ""
        }
        this.dbClient.emit('save_data', msgPayload);
      }
    });
  }

  async getSolanaTransactionData(payload: any) {
    console.log("Txn sig ", payload.destinationTransactionHash);
    const requestData = {
      "id": 1,
      "jsonrpc": "2.0",
      "method": "getTransaction",
      "params": [payload.destinationTransactionHash]
    }
    const response = await fetch(ALCHEMY_SOLANA_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    let updateData;
    if (response.ok) {
      const jsonResponse = await response.json();
      console.log("Solana transaction response ", jsonResponse);
      updateData = {
        sourceTransactionHash: payload.sourceTransactionHash,
        updatedAt: Date.now().toString(),
        destinationTransactionHash: payload.destinationTransactionHash,
        status: TransactionStatus.SUCCESS
      }
    } else {
      updateData = {
        sourceTransactionHash: payload.sourceTransactionHash,
        updatedAt: Date.now().toString(),
        status: TransactionStatus.FAIL
      }
    }

    this.dbClient.emit('update_data', updateData);

  }
}
