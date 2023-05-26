import { Module } from '@nestjs/common';
import { KegiatansService } from './kegiatans.service';
import { KegiatansController } from './kegiatans.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { KegiatanSchema } from './schemas/kegiatan.schema';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InviteSchema } from './schemas/invites.schema';
import { UserSchema } from 'src/auth/schemas/user.schema';

@Module({
  imports: [
    AuthModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('TOKEN_KEY'),
        };
      },
    }),
    MongooseModule.forFeature([{ name: 'Kegiatan', schema: KegiatanSchema }]),
    MongooseModule.forFeature([{ name: 'Invite', schema: InviteSchema }]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])
  ],
  controllers: [KegiatansController],
  providers: [KegiatansService]
})
export class KegiatansModule { }
