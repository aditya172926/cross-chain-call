import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { SenderContractABI } from '../constants/abis/SenderContract.abi';
import { SEPOLIA_CONTRACT_ADDRESS, SEPOLIA_RPC_URL } from 'src/constants/constant';

@Injectable()
export class EventsService {
    provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    contract = new ethers.Contract(SEPOLIA_CONTRACT_ADDRESS, SenderContractABI, this.provider);

    async getPublishedMessages () {
        console.log("Contract data ", await this.contract.getAddress())
        console.log("Targetted event ", this.contract.getEvent("MessagePublished"));

        // listening to events
        this.contract.on("MessagePublished", (from, to, value, event) => {
            console.log(from, to, value, event);
            if (event) {
                const transactionHash = event.log.transactionHash;
                console.log("Send this transaction log to polling service ", transactionHash);
            }
        });
    }
}
