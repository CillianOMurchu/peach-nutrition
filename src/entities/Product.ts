// src/entities/Product.ts
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("products") // Maps this class to the 'products' table
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "numeric", precision: 10, scale: 2, nullable: false })
  price!: number; // numeric(10, 2)

  @Column({ type: "integer", name: "stock_quantity", default: 0 })
  stockQuantity!: number;

  @Column({ type: "boolean", name: "is_available", default: true })
  isAvailable!: boolean;
}
