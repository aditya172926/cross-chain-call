# Inter blockchain Service

This project is used to send messages from an EVM chain to Solana to perform some actions on the destination chain.

This is the write-up about what I have implemented as of now.

The project is able to track the message sent from the source chain and to the destination chain and updates the status of the transaction in a No-sql database.

## Making of the project
The entire project is made up of 4 microservices communicating with each other. These microservices are in 4 different repositories and by design are able to run and scale independently of each other.

- Events Microservice
The **Events Microservice** is responsible for tracking of the transaction status and storing it in the database if a new transaction is made or the state of an existing one is updated.

A transaction can have 3 states
- SUCCESS: Successfully executed the destination contract logic
- PENDING: Awaiting confirmation from the destination chain
- FAIL: Failed to executed the destination contract logic

### Working of Events Microservice
This microservice is constantly listening to the smart contracts events which are emitted when a transaction is made on the EVM chain to send a message to the destination chain (Solana).

The service captures this triggered event and decodes the logs to find the transaction hash. This hash is stored in the database and also passed to a polling microservice.

- Polling Microservice
The polling microservice is used for getting the bytes value of the verified message from the protocol used to send message between chains. Here the protocol in use is Wormhole. 

By polling the Wormhole endpoint with the transaction hash received from the Events Microservice, we get the verified signed message from the Wormhole guardian nodes. This message is filtered out and now sent to a **Relayer Microservice**

- Relayer Microservice
The Relayer microservice is responsible for processing and sending the received message to a Solana program which implements the Wormhole's `receive` function. The microservice creates an instruction to call the receive function and sends the message data in bytes.
The message data once received by the Solana program decodes it and can conditionally perform operations, such as buy WIF tokens.

After a successful transaction on the Solana chain, the Relayer microservice receives a transaction signature in response. This transaction signature is sent to the **Events Microservice** to process.

The Events microservice takes this solana transaction signature and calls a POST request api to a Solana's node endpoint, provided by Alchemy.

If the response status is 200 and we receive a response object, an event is triggered to the Database service to update the transaction to 'SUCCESS' with the destinationTransactionHash and updatedAt timestamp.

If the response is null, an event is triggered to the Database service to update the transaction to 'FAIL' with the destinationTransactionHash being an empty string.

## Protocol Used
The protocol in use to send messages between blockchain is [Wormhole](https://wormhole.com/). 

Wormhole protocol provides the network and libraries to be used in our smart contracts on EVM and Solana to send and receive messages.

Currently it easily supports EVM to EVM data transfer without any off-chain services. But for inter-blockchain communication an off-chain component such as this microservices are required.

The microservices are responsible to fetch the message from the Wormhole guardian nodes, process it and send it to the Solana program receive function by Wormhole library.

### Workhole Protocol workings
The Wormhole guardian nodes are continuously watching the Wormhole Core Contract. They are the mechanism by which the messages are emitted. 

The messages need to be validated by the guardian nodes before they are sent further. When the majority of the nodes observe the message they sign a **keccak256 hash** of the message body.

It is wrapped into a structure called **Verified Action Approvals** which combines message with guardian signatures to form a proof. Although a VAA can be obtained by guardian RPC, even the transaction hash of the source chain will get you the VAA.

The VAA is the data that will be decoded on Solana to get the message. 
Read more about [VAA here](https://docs.wormhole.com/wormhole/explore-wormhole/vaa#vaa-format)

## Steps to run
Clone these 4 repositories
- [Events Microservice](https://github.com/aditya172926/cross-chain-call)
- [Polling Microservice](https://github.com/aditya172926/polling-service)
- [Relayer Microservice](https://github.com/aditya172926/relay-service)
- [Database Microservice](https://github.com/aditya172926/db-service)

Run `npm install` in each one the cloned repos

Set .env variables by viewing the .env.example and run `npm run start:dev` to start local servers for each microservice.

### Docker setup
wip