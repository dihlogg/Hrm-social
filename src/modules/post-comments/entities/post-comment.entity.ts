import { BaseEntities } from '../../../common/entities/base.entity';
import { Mention } from '../../mentions/entities/mention.entity';
import { Post } from '../../posts/entities/post.entity';
import { ReactionCount } from '../../reaction-count/entities/reaction-count.entity';
import { Reaction } from '../../reactions/entities/reaction.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('PostComments')
export class PostComment extends BaseEntities {
  @Column('uuid')
  employeeId: string;

  @Column({ nullable: true })
  employeeFullName: string;

  @Column({ nullable: true })
  employeeAvatarUrl: string;

  @Column()
  content: string;

  @Column({ nullable: true })
  postId: string;

  @ManyToOne(() => Post, (post) => post.postComments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  posts: Post;

  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => PostComment, (postComment) => postComment.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parent: PostComment;

  @OneToMany(() => PostComment, (postComment) => postComment.parent)
  children: PostComment[];

  @OneToMany(() => Reaction, (reaction) => reaction.postComments)
  reactions: Reaction[];

  @OneToMany(() => ReactionCount, (reactionCount) => reactionCount.postComments)
  reactionCounts: ReactionCount[];

  @OneToMany(() => Mention, (mention) => mention.postComment)
  mentions: Mention[];
}
