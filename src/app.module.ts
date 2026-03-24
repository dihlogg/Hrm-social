import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from './modules/posts/posts.module';
import { PostCommentsModule } from './modules/post-comments/post-comments.module';
import { ReactionsModule } from './modules/reactions/reactions.module';
import { ReactionCountModule } from './modules/reaction-count/reaction-count.module';
import { KafkaModule } from './kafka/kafka.module';
import { MentionsModule } from './modules/mentions/mentions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load .env
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: false,
    }),
    PostsModule,
    PostCommentsModule,
    ReactionsModule,
    ReactionCountModule,
    MentionsModule,
    KafkaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
