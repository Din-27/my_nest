import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { KegiatansModule } from './kegiatans/kegiatans.module';
import { Passport } from 'passport';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    AuthModule,
    KegiatansModule,
  ],
  controllers: [AppController],
  providers: [AppService, Passport],
})
export class AppModule { }
