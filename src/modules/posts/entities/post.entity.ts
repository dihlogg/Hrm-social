import { BaseEntities } from '../../../common/entities/base.entity';
import { Mention } from '../../mentions/entities/mention.entity';
import { PostComment } from '../../post-comments/entities/post-comment.entity';
import { ReactionCount } from '../../reaction-count/entities/reaction-count.entity';
import { Reaction } from '../../reactions/entities/reaction.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('Posts')
export class Post extends BaseEntities {
  @Column('uuid')
  employeeId: string;

  @Column({ nullable: true })
  employeeFullName: string;

  @Column({ nullable: true })
  employeeAvatarUrl: string;

  @Column()
  content: string;

  @Column('text', { array: true, nullable: true })
  imageUrls: string[];

  @Column()
  status: string;

  @OneToMany(() => PostComment, (postComment) => postComment.posts)
  postComments: PostComment[];

  @OneToMany(() => Reaction, (reaction) => reaction.posts)
  reactions: Reaction[];

  @OneToMany(() => ReactionCount, (reactionCount) => reactionCount.posts)
  reactionCounts: ReactionCount[];

  @OneToMany(() => Mention, (mention) => mention.post)
  mentions: Mention[];
}
