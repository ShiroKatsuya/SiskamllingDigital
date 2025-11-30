import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import type { Point } from 'geojson';
import { User } from '../users/user.entity';

export enum AlertStatus {
    ACTIVE = 'active',
    RESOLVED = 'resolved',
    FALSE_ALARM = 'false_alarm',
}

@Entity('alerts')
export class Alert {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @Index({ spatial: true })
    @Column({
        type: 'geometry',
        spatialFeatureType: 'Point',
        srid: 4326,
    })
    location: Point;

    @Column({
        type: 'enum',
        enum: AlertStatus,
        default: AlertStatus.ACTIVE,
    })
    status: AlertStatus;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ nullable: true })
    resolvedAt: Date;
}
