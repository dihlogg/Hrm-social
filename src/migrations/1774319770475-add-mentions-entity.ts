import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMentionsEntity1774319770475 implements MigrationInterface {
    name = 'AddMentionsEntity1774319770475'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Mentions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "mentionedEmployeeId" uuid NOT NULL, "authorId" uuid NOT NULL, "postId" uuid, "postCommentId" uuid, CONSTRAINT "PK_99bdd07a1ce6536057a83b021c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Mentions" ADD CONSTRAINT "FK_fc01c39036389533dce28df24a1" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Mentions" ADD CONSTRAINT "FK_b5a977b13f72421361525471474" FOREIGN KEY ("postCommentId") REFERENCES "PostComments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Mentions" DROP CONSTRAINT "FK_b5a977b13f72421361525471474"`);
        await queryRunner.query(`ALTER TABLE "Mentions" DROP CONSTRAINT "FK_fc01c39036389533dce28df24a1"`);
        await queryRunner.query(`DROP TABLE "Mentions"`);
    }

}
