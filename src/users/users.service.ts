import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

import * as bcypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { } // Dependecy Injection

  // 회원가입
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
  }
  // 전체 조회
  findAll() {
    return this.prisma.user.findMany();
  }

  // 로그인용(이메일로 찾기)
  async findOne(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
  // ID로 조회
  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
