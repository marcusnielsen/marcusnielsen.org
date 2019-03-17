import { Observable } from "rxjs";

export type Message = {
  type: string;
  cid: string;
  data?: any;
};

export interface IWebSocket {
  getMessageStream: () => Observable<Message>;
  publish: (type: string, data?: any) => string;
}