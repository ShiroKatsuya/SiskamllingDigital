import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus } from './report.entity';
import { EventsGateway } from '../events/events.gateway';

import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Report)
        private reportsRepository: Repository<Report>,
        private eventsGateway: EventsGateway,
        private usersService: UsersService,
        private notificationsService: NotificationsService,
    ) { }

    async create(reportData: Partial<Report>): Promise<Report> {
        const report = this.reportsRepository.create(reportData);
        const savedReport = await this.reportsRepository.save(report);

        // Fetch address from coordinates
        let address = 'Unknown location';
        let lat = 0, lng = 0;

        if (savedReport.location && savedReport.location.coordinates) {
            // Assuming coordinates are [lat, lng] based on frontend
            lat = savedReport.location.coordinates[0];
            lng = savedReport.location.coordinates[1];

            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                if (response.ok) {
                    const result = await response.json();
                    address = result.display_name || 'Address not found';
                }
            } catch (error) {
                console.error('Error fetching address:', error);
            }
        }

        // Emit Socket.IO event for real-time updates
        this.eventsGateway.emitNewReport({ ...savedReport, address });

        // Send Push Notifications
        const users = await this.usersService.findAll(); // You might want to filter this
        const payload = {
            title: 'Laporan Baru',
            body: `Laporan baru: ${savedReport.description?.substring(0, 50)}... \nLokasi: (${lat.toFixed(4)}, ${lng.toFixed(4)}) - ${address}`,
            url: '/dashboard', // Or specific report URL
            data: {
                reportId: savedReport.id,
                lat,
                lng,
                address
            }
        };

        for (const user of users) {
            await this.notificationsService.sendToUser(user, payload);
        }

        return savedReport;
    }

    async findAll(): Promise<Report[]> {
        return this.reportsRepository.find({ order: { createdAt: 'DESC' } });
    }

    async updateStatus(id: string, status: ReportStatus): Promise<Report | null> {
        await this.reportsRepository.update(id, { status });
        return this.reportsRepository.findOne({ where: { id } });
    }
}
