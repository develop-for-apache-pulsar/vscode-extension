import {WebSocket, Server} from "isomorphic-ws";
import {expect} from "chai";
import WebSocketReader from "../../../pulsarWebSocketReader/webSocketReader";
import {IncomingMessage} from "http";
import TopicMessage from "../../../pulsarWebSocketReader/topicMessage";
import { setTimeout } from "timers/promises";

describe("Web socket reader test suite", () => {
  const serverAddress: string = "ws://localhost:8080";
  const token: string = "token";
  let server: Server;
  const topicMessage = new TopicMessage("messageId", "publishTime", btoa("payload"), "key", {}, 0);

  before(() => {
    // Start a web socket server
    server = new Server({
      port: 8080, verifyClient: (info: {origin: string, secure: boolean, req: IncomingMessage}, next:any) => {
        return next(info.req.headers.authorization === `Bearer ${token}`);
      }
    });

    server.addListener("message", (client: WebSocket, request: IncomingMessage) => {
      console.log("Sending message");
      client.send(JSON.stringify(topicMessage));
    });

    server.addListener("connection", (client: WebSocket, request: IncomingMessage) => {
      client.send(JSON.stringify(topicMessage));
    });
  });

  after(() => {
    // Stop the web socket server
    server.close();
  });

  it("should listen for messages and close", async () => {
    const reader = new WebSocketReader(new URL(serverAddress), token);
    let nextCnt = 0;
    let errorCnt = 0;
    let completeCnt = 0;

    reader.open().subscribe({
      next: (value: any) => {
        console.log(value);
        nextCnt++;
      },
      error: (error: any) => {
        console.log(error);
        errorCnt++;
      },
      complete: () => {
        completeCnt++;
      }
    });

    await setTimeout(500); // Wait for the server to send the message

    reader.close();

    await setTimeout(500); // Wait for the server to complete the close

    expect(nextCnt).to.equal(1);
    expect(errorCnt).to.equal(0);
    expect(completeCnt).to.equal(1);
  });
});

/*
{
    "messageId": "COjdIxAQIAAwAQ==",
    "publishTime": "2023-03-30T18:42:23.527Z",
    "payload": "eyJfa2V5IjoiNmQxMGI1NTUtNTI1YS00NjYxLThjNDQtOWY1YzZkYTg0NmYzIiwiX3RpbWUiOiIxOTcwLTAxLTAxVDAwOjI4OjAwLjIwMTczNyIsImNsaWNrX3RpbWVzdGFtcCI6MTY4MDIwMTczNzcyMSwibWFpbl9jYXRlZ29yeSI6IlNwb3J0cyIsInN1Yl9jYXRlZ29yeSI6IlRlbm5pcyBSYWNrZXRzIiwidmlzaXRvcl9pZCI6IjZkMTBiNTU1LTUyNWEtNDY2MS04YzQ0LTlmNWM2ZGE4NDZmMyJ9",
    "properties": {},
    "redeliveryCount": 0,
    "_decodedPayload": "{\"_key\":\"6d10b555-525a-4661-8c44-9f5c6da846f3\",\"_time\":\"1970-01-01T00:28:00.201737\",\"click_timestamp\":1680201737721,\"main_category\":\"Sports\",\"sub_category\":\"Tennis Rackets\",\"visitor_id\":\"6d10b555-525a-4661-8c44-9f5c6da846f3\"}"
}
 */