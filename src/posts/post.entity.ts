import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostStatus } from './enums/post-status.enum';
import { PostType } from '@/post-types/post-type.entity';
import { Picture } from '@/pictures/picture.entity';
import { Category } from '@/categories/category.entity';
import { Tag } from '@/tags/tag.entity';
import { User } from '@/users/user.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 512,
    nullable: false,
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 256,
    nullable: false,
  })
  slug: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  content: string;

  @Column({
    type: 'enum',
    enum: PostStatus,
    nullable: false,
    default: PostStatus.DRAFT,
  })
  postStatus: string;

  @Column({
    type: 'timestamp', // 'datetime' in sql
    nullable: true,
  })
  publishedOn?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedDate: Date;

  // Relation
  // Wait to create the modules
  @ManyToOne(() => PostType, (postType) => postType.posts, {
    eager: true,
  })
  postType: PostType;

  @OneToOne(() => Picture, (picture) => picture.post, {
    eager: true,
    nullable: true,
  })
  thumbnail?: Picture;

  @ManyToMany(() => Picture, (picture) => picture.posts, {
    eager: true,
    nullable: true,
  })
  @JoinTable()
  pictures?: Picture[];

  @ManyToOne(() => Category, (category) => category.posts, {
    eager: true,
  })
  category: Category;

  @ManyToMany(() => Tag, (tag) => tag.posts, {
    eager: true,
    nullable: true,
  })
  @JoinTable()
  tags?: Tag[];

  @ManyToOne(() => User, (user) => user.posts, {
    eager: true,
  })
  author: User;
}
