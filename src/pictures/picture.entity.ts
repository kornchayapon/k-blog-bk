import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Post } from '@/posts/post.entity';
import { Category } from '@/categories/category.entity';

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
  // @OneToOne(() => Post, (post) => post.thumbnail, { onDelete: 'CASCADE' })
  // @JoinColumn()
  // post?: Post;

  @OneToMany(() => Category, (category) => category.thumbnail)
  categoryPosts: Post[];

  @OneToMany(() => Post, (post) => post.thumbnail)
  thumbnailPosts: Post[];

  @ManyToMany(() => Post, (post) => post.pictures, { onDelete: 'CASCADE' })
  picturePosts: Post[];
}
