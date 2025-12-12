import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/client';

@Injectable()       // NestJS의 IoC 컨테이너가 관리할 수 있는 Provider로 만든다. 
export class PrismaService extends PrismaClient implements OnModuleInit {
    async onModuleInit() { // 모듈이 초기화 될 떄 DB 연결 수행
        await this.$connect(); // 생성자는 동기 함수라 await를 못 쓴다. 비동기작업을 하려면 onModuleInit이 필요함.
    }
}