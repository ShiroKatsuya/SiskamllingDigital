import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.usersRepository.create(userData);
        return this.usersRepository.save(user);
    }

    async findOne(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { email },
            select: ['id', 'name', 'email', 'password', 'role', 'phone', 'fcmToken'],
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async addPushSubscription(userId: string, subscription: any) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (user) {
            const subscriptions = user.pushSubscriptions || [];
            // Avoid duplicates
            const exists = subscriptions.some(s => s.endpoint === subscription.endpoint);
            if (!exists) {
                subscriptions.push(subscription);
                user.pushSubscriptions = subscriptions;
                await this.usersRepository.save(user);
            }
        }
    }
}
