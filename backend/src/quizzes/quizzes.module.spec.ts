import 'reflect-metadata';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { NotificationsModule } from '../notifications/notifications.module';
import { RewardsModule } from '../rewards/rewards.module';
import { UsersModule } from '../users/users.module';
import { QuizzesModule } from './quizzes.module';

describe('QuizzesModule', () => {
  it('imports modules required for quiz pass side effects', () => {
    const imports = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      QuizzesModule,
    ) as unknown[];

    expect(imports).toEqual(
      expect.arrayContaining([RewardsModule, NotificationsModule, UsersModule]),
    );
  });
});
