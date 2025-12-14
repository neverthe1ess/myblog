import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto, authorId: number) {
    return this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        post: { connect: { id: createCommentDto.postId } },
        author: { connect: { id: authorId } },
      },
    });
  }

  findAll() {
    return this.prisma.comment.findMany({
      include: {
        author: { select: { nickname: true } },
        post: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.comment.findUnique({
      where: { id },
      include: { author: true, post: true },
    });
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
