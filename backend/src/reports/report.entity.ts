import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import type { Point } from 'geojson';
import { User } from '../users/user.entity';

export enum ReportType {
    ROAD_DAMAGE = 'road_damage',
    STREET_LIGHT = 'street_light',
    SUSPICIOUS = 'suspicious',
    OTHER = 'other',
}

export enum ReportStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
    REJECTED = 'rejected',
}

@Entity('reports')
export class Report {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: ReportType,
    })
    type: ReportType;

    @Column('text')
    description: string;

    @Column({ nullable: true })
    photoUrl: string;

    @Index({ spatial: true })
    @Column({
        type: 'geometry',
        spatialFeatureType: 'Point',
        srid: 4326,
    })
    location: Point;

    @Column({
        type: 'enum',
        enum: ReportStatus,
        default: ReportStatus.PENDING,
    })
    status: ReportStatus;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ nullable: true })
    userId: string;

    @CreateDateColumn()
    createdAt: Date;
}
