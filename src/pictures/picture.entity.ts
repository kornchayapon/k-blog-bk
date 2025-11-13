import { Category } from '@/categories/category.entity';
import { Post } from '@/posts/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Picture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 1024,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 1024,
    nullable: false,
  })
  path: string;

  @Column({
    type: 'varchar',
    length: 1024,
    nullable: false,
  })
  size: number;

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

  // post
  @OneToOne(() => Post, (post) => post.thumbnail, {
    nullable: true,
  })
  @JoinColumn()
  post: Post;

  @ManyToMany(() => Post, (post) => post.pictures, { onDelete: 'CASCADE' })
  posts: Post[];

  // category
  @OneToOne(() => Category, (category) => category.thumbnail, {
    nullable: true,
  })
  @JoinColumn()
  category: Category;
}
