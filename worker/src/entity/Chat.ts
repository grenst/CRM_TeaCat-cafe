import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Message } from './Message.js';
import { User } from './User.js';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column({ unique: true })
    telegramChatId!: string;

  @Column({ nullable: true })
    title!: string;

  @Column({ nullable: true })
    type!: string; // e.g., 'private', 'group', 'supergroup', 'channel'

  @ManyToOne(() => User, (user: User) => user.createdChats)
  @JoinColumn({ name: 'creatorId' })
    creator!: User;

  @Column({ nullable: true })
    creatorId!: number;

  @OneToMany(() => Message, (message: Message) => message.chat)
    messages!: Message[];
}
