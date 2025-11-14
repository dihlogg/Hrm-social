import { BaseEntities } from 'src/common/entities/base.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { ReactionCount } from 'src/modules/reaction-count/entities/reaction-count.entity';
import { Reaction } from 'src/modules/reactions/entities/reaction.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('PostComments')
export class PostComment extends BaseEntities {
  @Column('uuid')
  employeeId: string;

  @Column()
  content: string;

  @Column({ nullable: true })
  postId: string;

  @ManyToOne(() => Post, (post) => post.postComments)
  @JoinColumn({ name: 'postId' })
  posts: Post;

  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => PostComment, (postComment) => postComment.children, {
    nullable: true,
  })
  parent: PostComment;

  @OneToMany(() => PostComment, (postComment) => postComment.parent)
  children: PostComment[];

  @OneToMany(() => Reaction, (reaction) => reaction.postComments)
  reactions: Reaction[];

  @OneToMany(() => ReactionCount, (reactionCount) => reactionCount.postComments)
  reactionCounts: ReactionCount[];
}
