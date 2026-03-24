import { BaseEntities } from 'src/common/entities/base.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { PostComment } from 'src/modules/post-comments/entities/post-comment.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('Mentions')
export class Mention extends BaseEntities {
  @Column('uuid')
  mentionedEmployeeId: string;

  @Column('uuid')
  authorId: string;

  @Column({ nullable: true })
  postId: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column({ nullable: true })
  postCommentId: string;

  @ManyToOne(() => PostComment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postCommentId' })
  postComment: PostComment;
}
