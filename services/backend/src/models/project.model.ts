import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { User } from "./user.model.js";
// Using a string enum instead of importing from @idea-hub/shared to avoid ESM import issues
// We'll ensure values match with shared package

enum ProjectStatus {
  IN_PROGRESS = "in progress",
  COMPLETED = "completed",
  ON_HOLD = "on hold",
}

@Table({
  tableName: "projects",
  timestamps: true,
})
export class Project extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.ENUM(...Object.values(ProjectStatus)),
    defaultValue: ProjectStatus.IN_PROGRESS,
  })
  status!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  githubRepoUrl?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  localFolderPath?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  documentation?: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  tags!: string[];

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastSynced?: Date;

  @Column({
    type: DataType.ARRAY(DataType.FLOAT),
    allowNull: true,
  })
  embedding?: number[];

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
