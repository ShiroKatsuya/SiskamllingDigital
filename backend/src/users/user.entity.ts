import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import type { Point } from 'geojson';

export enum UserRole {
    CITIZEN = 'citizen',
    POLICE = 'police',
    ADMIN = 'admin',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password?: string;

    @Column({ nullable: true })
    phone: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CITIZEN,
    })
    role: UserRole;

    @Index({ spatial: true })
    @Column({
        type: 'geometry',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true,
    })
    location: Point;

    @Column({ nullable: true })
    fcmToken: string;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    pushSubscriptions: any[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
