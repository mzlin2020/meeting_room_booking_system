import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { Role } from './user/entities/role.entity';
import { Permission } from './user/entities/permission.entity';
import { MeetingRoom } from './metting-room/entities/metting-room.entity';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { LoginGuard } from './login.guard';
import { PermissionGuard } from './permission.guard';
import { MettingRoomModule } from './metting-room/metting-room.module';
import { BookingModule } from './booking/booking.module';
import { Booking } from './booking/entities/booking.entity';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: path.join(__dirname, '.env') }),
    TypeOrmModule.forRootAsync({
      useFactory(configService: ConfigService) {
        return {
          type: 'mysql',
          host: configService.get('mysql_server_host'),
          port: configService.get('mysql_server_post'),
          username: configService.get('mysql_server_username'),
          password: configService.get('mysql_server_password'),
          database: configService.get('mysql_server_database'),
          synchronize: true,
          logging: false,
          entities: [User, Role, Permission, MeetingRoom, Booking],
          poolSize: 10,
          connectorPackage: 'mysql2',
          extra: {
            authPlugin: 'sha256_password',
          },
        };
      },
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get('jwt_secret'),
          signOptions: {
            expiresIn: '30m',
          },
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
    RedisModule,
    EmailModule,
    MettingRoomModule,
    BookingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 登录守卫
    {
      provide: APP_GUARD,
      useClass: LoginGuard,
    },
    // 权限校验
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
