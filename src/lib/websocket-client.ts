class WebSocketClient {
  private static instance: WebSocketClient;
  private ws: WebSocket | null = null;
  private url: string = "";
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;

  private constructor() {}

  static getInstance(): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient();
    }
    return WebSocketClient.instance;
  }

  connect(url: string): void {
    this.url = url;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {};

    this.ws.onclose = () => {
      this.reconnect();
    };

    this.ws.onerror = (error) => {};
  }

  send(data: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect(this.url);
      }, this.reconnectInterval * this.reconnectAttempts);
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export default WebSocketClient;
