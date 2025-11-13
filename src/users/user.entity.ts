import { Post } from '@/posts/post.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: '100',
    nullable: false,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    length: '100',
    nullable: false,
  })
  lastName: string;

  @Column({
    type: 'varchar',
    length: '100',
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: '100',
    nullable: false,
  })
  password: string;

  @Column({
    type: 'varchar',
    length: '256',
    nullable: true,
  })
  token: string;

  @Column({
    default: true,
  })
  active: boolean;

  @Column({
    type: 'int',
    default: 0, // 0 - member, 1 - admin, 2 - staff
  })
  role: number;

  @Column({
    type: 'varchar',
    length: '256',
    nullable: true,
  })
  avatar: string;

  @Column({
    type: 'varchar',
    length: '16',
    nullable: true,
  })
  mobile: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedDate: Date;

  // Relation author to user
  // ✅ Self relation: create by user (author)
  @ManyToOne(() => User, (user) => user.createdUsers, { nullable: true })
  author: User;

  // ✅ user list created by this user
  @OneToMany(() => User, (user) => user.author)
  createdUsers: User[];

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];
}
