import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Learning Board E2E Tests', () => {
  let app: INestApplication;
  let jwtToken: string;
  let userId: number;
  let postId: number;

  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    nickname: 'ProTester',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth Module', () => {
    it('/users (POST) - 회원가입 성공', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      expect(response.body.email).toBe(testUser.email);
      expect(response.body.password).toBeUndefined(); // 비밀번호 노출 확인
      userId = response.body.id;
    });

    it('/users (POST) - 중복 이메일 가입 실패 (409 Conflict)', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(409);
    });

    it('/auth/login (POST) - 로그인 성공 & 토큰 발급', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(201);

      expect(response.body.access_token).toBeDefined();
      jwtToken = response.body.access_token;
    });

    it('/auth/login (POST) - 비밀번호 틀림 (401 Unauthorized)', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: 'wrongPassword' })
        .expect(401);
    });

    it('/users/profile (GET) - 내 정보 조회 (토큰 사용)', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body.email).toBe(testUser.email);
      expect(response.body.id).toBe(userId);
    });

    it('/users/profile (GET) - 토큰 없이 접근 (401 Unauthorized)', () => {
      return request(app.getHttpServer()).get('/users/profile').expect(401);
    });
  });

  describe('Posts Module', () => {
    it('/posts (POST) - 게시글 작성 성공', async () => {
      const response = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'E2E Test Post',
          content: 'Testing automatic post creation.',
        })
        .expect(201);

      expect(response.body.title).toBe('E2E Test Post');
      expect(response.body.authorId).toBe(userId);
      postId = response.body.id;
    });

    it('/posts (POST) - 제목 누락 실패 (400 Bad Request)', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          content: 'No Title Here',
        })
        .expect(400); // DTO Validation Pipe 동작 확인
    });

    it('/posts (GET) - 게시글 목록 조회 (Public)', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts')
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Comments Module', () => {
    it('/comments (POST) - 댓글 작성 성공', async () => {
      const response = await request(app.getHttpServer())
        .post('/comments')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          content: 'Nice Post!',
          postId: postId,
        })
        .expect(201);

      expect(response.body.content).toBe('Nice Post!');
      expect(response.body.postId).toBe(postId);
      expect(response.body.authorId).toBe(userId);
    });

    it('/comments (POST) - 존재하지 않는 게시글에 댓글 (Error)', () => {
      // Prisma Relation 에러가 보통 500이나 400으로 뜸 (ForeignKeyConstraintViolation)
      return request(app.getHttpServer())
        .post('/comments')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          content: 'Ghost Comment',
          postId: 999999,
        })
        .expect((res) => {
          if (res.status !== 500 && res.status !== 400 && res.status !== 404) {
            throw new Error(`Unexpected status code: ${res.status}`);
          }
        });
    });
  });
});
