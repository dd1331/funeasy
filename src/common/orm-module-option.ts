import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const ormModuleOption: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  database: 'funeasy_local',
  autoLoadEntities: true,
  synchronize: true,
  dropSchema: true,
};
