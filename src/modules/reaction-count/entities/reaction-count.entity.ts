import { BaseEntities } from "src/common/entities/base.entity";
import { PostComment } from "src/modules/post-comments/entities/post-comment.entity";
import { Post } from "src/modules/posts/entities/post.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity('ReactionCounts')
export class ReactionCount extends BaseEntities {
    @Column()
    reactionType: string;

    @Column()
    count: number;

    @Column({ nullable: true})
    postId: string;

    @ManyToOne(() => Post, (post) => post.reactionCounts)
    @JoinColumn({ name: 'postId'})
    posts: Post

    @Column({ nullable: true})
    postCommentId: string;

    @ManyToOne(() => PostComment, (postComment) => postComment.reactionCounts)
    @JoinColumn({ name: 'postCommentId'})
    postComments: PostComment
}
