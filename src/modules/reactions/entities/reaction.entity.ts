import { BaseEntities } from '../../../common/entities/base.entity';
import { PostComment } from '../../post-comments/entities/post-comment.entity';
import { Post } from '../../posts/entities/post.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

@Entity('Reactions')
@Unique('UQ_USER_POST_REACTION', ['employeeId', 'postId'])
@Unique('UQ_USER_COMMENT_REACTION', ['employeeId', 'postCommentId'])
export class Reaction extends BaseEntities {
  @Column('uuid')
  employeeId: string;

  @Column({ nullable: true })
  employeeFullName: string;

  @Column({ nullable: true })
  employeeAvatarUrl: string;

  @Column()
  reactionType: string;

  @Column({ nullable: true })
  postId: string;

  @ManyToOne(() => Post, (post) => post.reactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  posts: Post;

  @Column({ nullable: true })
  postCommentId: string;

  @ManyToOne(() => PostComment, (postComment) => postComment.reactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postCommentId' })
  postComments: PostComment;
}
