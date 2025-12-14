import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 1. 전역 모듈 설정
@Module({
  providers: [PrismaService], // 2. IoC 컨테이너에게 이 모듈 안에서 PrismaService 인스턴스를 하나 만들어서 관리해줘
  exports: [PrismaService], // 3. 다른 모듈이 주입받아서 사용할 수 있도록 외부 공개
})
export class PrismaModule {}
