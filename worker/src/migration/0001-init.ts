import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class Init0001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create User table
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'telegramId',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'firstName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'lastName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'username',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create Chat table
    await queryRunner.createTable(
      new Table({
        name: 'chat',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'telegramChatId',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'creatorId',
            type: 'int',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Add foreign key to Chat table referencing User
    await queryRunner.createForeignKey(
      'chat',
      new TableForeignKey({
        columnNames: ['creatorId'],
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        name: 'FK_chat_creator',
        referencedTableName: 'user',
      }),
    );

    // Create Message table
    await queryRunner.createTable(
      new Table({
        name: 'message',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'telegramMessageId',
            type: 'varchar',
          },
          {
            name: 'text',
            type: 'text',
          },
          {
            name: 'date',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'userId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'chatId',
            type: 'int',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Add foreign keys to Message table referencing User and Chat
    await queryRunner.createForeignKey(
      'message',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        name: 'FK_message_user',
        referencedTableName: 'user',
      }),
    );

    await queryRunner.createForeignKey(
      'message',
      new TableForeignKey({
        columnNames: ['chatId'],
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        name: 'FK_message_chat',
        referencedTableName: 'chat',
      }),
    );

    // Add GIN index on Message.text for full-text search
    await queryRunner.createIndex(
      'message',
      new TableIndex({
        name: 'message_text_gin_idx',
        columnNames: ['text'],
        isFulltext: true,
        // TypeORM will generate the correct SQL for GIN index with isFulltext: true for Postgres
        // For Postgres, this typically translates to `CREATE INDEX ... USING GIN (to_tsvector('english', text))`
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop GIN index
    await queryRunner.dropIndex('message', 'message_text_gin_idx');

    // Drop foreign keys
    await queryRunner.dropForeignKey('message', 'FK_message_user');
    await queryRunner.dropForeignKey('message', 'FK_message_chat');
    await queryRunner.dropForeignKey('chat', 'FK_chat_creator');

    // Drop tables
    await queryRunner.dropTable('message');
    await queryRunner.dropTable('chat');
    await queryRunner.dropTable('user');
  }
}
