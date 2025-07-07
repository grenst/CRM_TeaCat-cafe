import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Message } from './Message.js';
import { Chat } from './Chat.js';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column({ unique: true })
    telegramId!: string;

  @Column({ nullable: true })
    firstName!: string;

  @Column({ nullable: true })
    lastName!: string;

  @Column({ nullable: true })
    username!: string;

  @OneToMany(() => Message, (message: Message) => message.user)
    messages!: Message[];

  @OneToMany(() => Chat, (chat: Chat) => chat.creator)
    createdChats!: Chat[];
}
