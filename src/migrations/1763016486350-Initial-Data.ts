import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialData1763016486350 implements MigrationInterface {
    name = 'InitialData1763016486350'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ReactionCounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "reactionType" character varying NOT NULL, "count" integer NOT NULL, "postId" uuid, "postCommentId" uuid, CONSTRAINT "PK_cabb5bdbdbd9349ea3aa59b6121" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Reactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "employeeId" uuid NOT NULL, "reactionType" character varying NOT NULL, "postId" uuid, "postCommentId" uuid, CONSTRAINT "PK_8e7a9226a42a2a796ce5993a5a2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "employeeId" uuid NOT NULL, "content" character varying NOT NULL, "imageUrl" character varying, "status" character varying NOT NULL, CONSTRAINT "PK_0f050d6d1112b2d07545b43f945" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "PostComments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "employeeId" uuid NOT NULL, "content" character varying NOT NULL, "postId" uuid, "parentId" uuid, CONSTRAINT "PK_2440dc3d7ccd7aff688fc008336" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ReactionCounts" ADD CONSTRAINT "FK_93a698ebf0ffe681f067ac5c0d5" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ReactionCounts" ADD CONSTRAINT "FK_72055ac6eab60d1957eafcd28d2" FOREIGN KEY ("postCommentId") REFERENCES "PostComments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Reactions" ADD CONSTRAINT "FK_cf2018739f90313e8f7b39c4b39" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Reactions" ADD CONSTRAINT "FK_7db18ecc70e9e59b95add5a7725" FOREIGN KEY ("postCommentId") REFERENCES "PostComments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PostComments" ADD CONSTRAINT "FK_1447229657793c6cd181e3f32aa" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PostComments" ADD CONSTRAINT "FK_f6f327ec68b7f0259126fa8c053" FOREIGN KEY ("parentId") REFERENCES "PostComments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "PostComments" DROP CONSTRAINT "FK_f6f327ec68b7f0259126fa8c053"`);
        await queryRunner.query(`ALTER TABLE "PostComments" DROP CONSTRAINT "FK_1447229657793c6cd181e3f32aa"`);
        await queryRunner.query(`ALTER TABLE "Reactions" DROP CONSTRAINT "FK_7db18ecc70e9e59b95add5a7725"`);
        await queryRunner.query(`ALTER TABLE "Reactions" DROP CONSTRAINT "FK_cf2018739f90313e8f7b39c4b39"`);
        await queryRunner.query(`ALTER TABLE "ReactionCounts" DROP CONSTRAINT "FK_72055ac6eab60d1957eafcd28d2"`);
        await queryRunner.query(`ALTER TABLE "ReactionCounts" DROP CONSTRAINT "FK_93a698ebf0ffe681f067ac5c0d5"`);
        await queryRunner.query(`DROP TABLE "PostComments"`);
        await queryRunner.query(`DROP TABLE "Posts"`);
        await queryRunner.query(`DROP TABLE "Reactions"`);
        await queryRunner.query(`DROP TABLE "ReactionCounts"`);
    }

}
