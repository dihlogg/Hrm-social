import { BaseEntities } from 'src/common/entities/base.entity';
import { PostComment } from 'src/modules/post-comments/entities/post-comment.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

@Entity('Reactions')
@Unique('UQ_USER_POST_REACTION', ['employeeId', 'postId'])
@Unique('UQ_USER_COMMENT_REACTION', ['employeeId', 'postCommentId'])
export class Reaction extends BaseEntities {
  @Column('uuid')
  employeeId: string;

  @Column({ nullable: true})
  employeeFullName: string;

  @Column()
  reactionType: string;

  @Column({ nullable: true })
  postId: string;

  @ManyToOne(() => Post, (post) => post.reactions)
  @JoinColumn({ name: 'postId' })
  posts: Post;

  @Column({ nullable: true })
  postCommentId: string;

  @ManyToOne(() => PostComment, (postComment) => postComment.reactions)
  @JoinColumn({ name: 'postCommentId' })
  postComments: PostComment;
}
