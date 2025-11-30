import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../users/users.service';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly usersService: UsersService) { }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('locationUpdate')
  async handleLocationUpdate(
    @MessageBody() data: { userId: string; lat: number; lng: number },
    @ConnectedSocket() client: Socket,
  ) {
    // Update user location in DB
    // await this.usersService.updateLocation(data.userId, data.lat, data.lng);
    // For now just broadcast to others for realtime map
    client.broadcast.emit('userLocation', data);
  }

  @SubscribeMessage('panic')
  async handlePanic(@MessageBody() data: { userId: string; lat: number; lng: number }) {
    console.log(`Panic alert from ${data.userId} at ${data.lat}, ${data.lng}`);

    let address = 'Unknown location';
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.lat}&lon=${data.lng}`);
      if (response.ok) {
        const result = await response.json();
        address = result.display_name || 'Address not found';
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }

    const payload = { ...data, address };

    // Broadcast to all clients
    this.server.emit('panicAlert', payload);
    // TODO: Find nearby users and notify them specifically via FCM
  }

  // Method to emit new report to all clients
  emitNewReport(report: any) {
    console.log(`Broadcasting new report: ${report.id}`);
    this.server.emit('newReport', report);
  }
}
