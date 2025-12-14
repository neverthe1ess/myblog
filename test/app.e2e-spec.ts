import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true })); // 실제 앱이랑 똑같이 설정
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // 1. 회원가입 테스트
  it('/users (POST) - 회원가입', () => {
    const uniqueEmail = `test_${Date.now()}@example.com`; // 매번 다른 이메일 생성
    return request(app.getHttpServer())
      .post('/users')
      .send({
        email: uniqueEmail,
        password: 'password123',
        nickname: 'TESTER',
      })
      .expect(201);
  });

  // 2. 로그인 테스트 (토큰 얻기)
  it('/auth/login (POST) - 로그인 & 토큰 획득', async () => {
    // 방금 가입한 유저로 로그인 시도 (가입 테스트와 별개로, 테스트용 고정 계정을 쓰는 게 좋지만 일단 간단히)
    // *주의: 위 테스트랑 순서 의존성이 있어서 사실 좋진 않지만, 흐름 파악용입니다.*

    // 안전하게 새 유저 만들고 로그인
    const email = `login_${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/users')
      .send({ email, password: 'pw', nickname: 'nick' });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'pw' })
      .expect(201);

    jwtToken = response.body.access_token; // 🔑 토큰 저장!
    console.log('Got Token:', jwtToken);
  });

  // 3. 게시글 작성 테스트 (토큰 사용)
  it('/posts (POST) - 게시글 작성', () => {
    return request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${jwtToken}`) // 🛡️ 헤더에 토큰 장착
      .send({
        title: '자동화된 테스트 글',
        content: 'curl아 이제 안녕~',
      })
      .expect(201)
      .expect((res) => {
        // 응답 검사
        if (res.body.title !== '자동화된 테스트 글')
          throw new Error('제목이 달라요!');
      });
  });
});
