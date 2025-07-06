import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, CreateDateColumn } from 'typeorm';
import { User } from './User.js';
import { Chat } from './Chat.js';

@Entity()
@Index('message_text_gin_idx', ['text'], { fulltext: true })
export class Message {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    telegramMessageId!: string;

  @Column({ type: 'text' })
    text!: string;

  @CreateDateColumn()
    date!: Date;

  @ManyToOne(() => User, (user: User) => user.messages)
    user!: User;

  @ManyToOne(() => Chat, (chat: Chat) => chat.messages)
    chat!: Chat;
}
