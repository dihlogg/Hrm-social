import { BaseEntities } from "src/common/entities/base.entity";
import { PostComment } from "src/modules/post-comments/entities/post-comment.entity";
import { ReactionCount } from "src/modules/reaction-count/entities/reaction-count.entity";
import { Reaction } from "src/modules/reactions/entities/reaction.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity('Posts')
export class Post extends BaseEntities {
    @Column('uuid')
    employeeId: string;

    @Column()
    content: string;

    @Column({ nullable: true})
    imageUrl: string;

    @Column()
    status: string;

    @OneToMany(() => PostComment, (postComment) => postComment.posts)
    postComments: PostComment[];

    @OneToMany(() => Reaction, (reaction) => reaction.posts)
    reactions: Reaction[]

    @OneToMany(() => ReactionCount, (reactionCount) => reactionCount.posts)
    reactionCounts: ReactionCount[]
}
