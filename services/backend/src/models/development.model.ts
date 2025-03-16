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
enum DevelopmentType {
  ARTICLE = "ARTICLE",
  LIBRARY = "LIBRARY",
  FRAMEWORK = "FRAMEWORK",
  TOOL = "TOOL",
  TECHNIQUE = "TECHNIQUE",
  API = "API",
  CONCEPT = "CONCEPT",
  OTHER = "OTHER",
}

@Table({
  tableName: "developments",
  timestamps: true,
})
export class Development extends Model {
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
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content!: string;

  @Column({
    type: DataType.ENUM(...Object.values(DevelopmentType)),
    defaultValue: DevelopmentType.OTHER,
  })
  type!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  source?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  sourceUrl?: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  tags!: string[];

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
