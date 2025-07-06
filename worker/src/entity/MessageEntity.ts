import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class MessageEntity {
  @PrimaryGeneratedColumn('increment')
    id!: number;

  @Column({ type: 'text' })
    chatId!: string;

  @Column({ type: 'text' })
    messageId!: string;

  @Column({ type: 'text' })
    text!: string;

  @Column({ type: 'varchar', length: 8 })
    language!: string;

  @Column({ type: 'float' })
    sentimentScore!: number;

  @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;
}