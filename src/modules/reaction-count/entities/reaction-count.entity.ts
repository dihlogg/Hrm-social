import { BaseEntities } from "../../../common/entities/base.entity";
import { PostComment } from "../../post-comments/entities/post-comment.entity";
import { Post } from "../../posts/entities/post.entity";
import { Column, Entity, JoinColumn, ManyToOne, Unique } from "typeorm";

@Entity('ReactionCounts')
@Unique('UQ_POST_REACTION', ['postId', 'reactionType'])
@Unique('UQ_COMMENT_REACTION', ['postCommentId', 'reactionType'])
export class ReactionCount extends BaseEntities {
    @Column()
    reactionType: string;

    @Column({ default: 0 })
    count: number;

    @Column({ nullable: true})
    postId: string;

    @ManyToOne(() => Post, (post) => post.reactionCounts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId'})
    posts: Post

    @Column({ nullable: true})
    postCommentId: string;

    @ManyToOne(() => PostComment, (postComment) => postComment.reactionCounts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postCommentId'})
    postComments: PostComment
}
