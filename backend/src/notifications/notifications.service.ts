
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as webpush from 'web-push';

@Injectable()
export class NotificationsService implements OnModuleInit {
    onModuleInit() {
        const publicKey = process.env.VAPID_PUBLIC_KEY;
        const privateKey = process.env.VAPID_PRIVATE_KEY;
        const subject = process.env.VAPID_SUBJECT;

        if (!publicKey || !privateKey || !subject) {
            console.error('VAPID keys are missing in .env');
            return;
        }

        webpush.setVapidDetails(subject, publicKey, privateKey);
    }

    async sendNotification(subscription: any, payload: any) {
        try {
            await webpush.sendNotification(subscription, JSON.stringify(payload));
        } catch (error) {
            console.error('Error sending push notification:', error);
        }
    }

    async sendToUser(user: any, payload: any) {
        if (!user.pushSubscriptions || user.pushSubscriptions.length === 0) {
            return;
        }

        const promises = user.pushSubscriptions.map(async (sub) => {
            try {
                await this.sendNotification(sub, payload);
            } catch (error) {
                if (error.statusCode === 410 || error.statusCode === 404) {
                    // Subscription is invalid, should be removed (TODO: implement cleanup)
                    console.log('Subscription expired/invalid');
                }
            }
        });

        await Promise.all(promises);
    }
}
