import {
  users,
  products,
  reviews,
  cartItems,
  orders,
  orderItems,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Review,
  type InsertReview,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type ProductWithSeller,
  type CartItemWithProduct,
  type OrderWithItems,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, ilike, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserCarbonSaved(id: string, carbonSaved: number): Promise<void>;

  // Product operations
  getProducts(params?: {
    category?: string;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ProductWithSeller[]>;
  getProduct(id: string): Promise<ProductWithSeller | undefined>;
  getProductsByUser(userId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  incrementProductViews(id: string): Promise<void>;

  // Review operations
  getProductReviews(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Cart operations
  getCartItems(userId: string): Promise<CartItemWithProduct[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Order operations
  getOrders(userId: string): Promise<OrderWithItems[]>;
  getOrder(id: string): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserCarbonSaved(id: string, carbonSaved: number): Promise<void> {
    await db
      .update(users)
      .set({
        totalCarbonSaved: sql`${users.totalCarbonSaved} + ${carbonSaved}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  // Product operations
  async getProducts(params: {
    category?: string;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<ProductWithSeller[]> {
    const { category, search, featured, limit = 20, offset = 0 } = params;

    let query = db
      .select()
      .from(products)
      .innerJoin(users, eq(products.sellerId, users.id))
      .leftJoin(reviews, eq(products.id, reviews.productId))
      .where(eq(products.available, true));

    if (category) {
      query = query.where(eq(products.category, category as any));
    }

    if (search) {
      query = query.where(
        ilike(products.title, `%${search}%`)
      );
    }

    if (featured) {
      query = query.where(eq(products.featured, true));
    }

    const result = await query
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    // Group results by product
    const productMap = new Map();
    
    result.forEach((row) => {
      const productId = row.products.id;
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          ...row.products,
          seller: row.users,
          reviews: []
        });
      }
      if (row.reviews) {
        productMap.get(productId).reviews.push(row.reviews);
      }
    });

    return Array.from(productMap.values());
  }

  async getProduct(id: string): Promise<ProductWithSeller | undefined> {
    const result = await db
      .select()
      .from(products)
      .innerJoin(users, eq(products.sellerId, users.id))
      .leftJoin(reviews, eq(products.id, reviews.productId))
      .where(eq(products.id, id));

    if (result.length === 0) return undefined;

    const productData = result[0].products;
    const seller = result[0].users;
    const reviewsList = result.filter(r => r.reviews).map(r => r.reviews!);

    return {
      ...productData,
      seller,
      reviews: reviewsList
    };
  }

  async getProductsByUser(userId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.sellerId, userId))
      .orderBy(desc(products.createdAt));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async incrementProductViews(id: string): Promise<void> {
    await db
      .update(products)
      .set({ views: sql`${products.views} + 1` })
      .where(eq(products.id, id));
  }

  // Review operations
  async getProductReviews(productId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }

  // Cart operations
  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    const result = await db
      .select()
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .innerJoin(users, eq(products.sellerId, users.id))
      .leftJoin(reviews, eq(products.id, reviews.productId))
      .where(and(
        eq(cartItems.userId, userId),
        eq(products.available, true)
      ));

    // Group by cart item
    const cartMap = new Map();
    
    result.forEach((row) => {
      const cartItemId = row.cart_items.id;
      if (!cartMap.has(cartItemId)) {
        cartMap.set(cartItemId, {
          ...row.cart_items,
          product: {
            ...row.products,
            seller: row.users,
            reviews: []
          }
        });
      }
      if (row.reviews) {
        cartMap.get(cartItemId).product.reviews.push(row.reviews);
      }
    });

    return Array.from(cartMap.values());
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const [cartItem] = await db
      .insert(cartItems)
      .values(item)
      .returning();
    return cartItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async getOrders(userId: string): Promise<OrderWithItems[]> {
    const result = await db
      .select()
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .leftJoin(users, eq(orderItems.sellerId, users.id))
      .where(eq(orders.buyerId, userId))
      .orderBy(desc(orders.createdAt));

    // Group by order
    const orderMap = new Map();
    
    result.forEach((row) => {
      const orderId = row.orders.id;
      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, {
          ...row.orders,
          items: []
        });
      }
      if (row.order_items && row.products && row.users) {
        orderMap.get(orderId).items.push({
          ...row.order_items,
          product: row.products,
          seller: row.users
        });
      }
    });

    return Array.from(orderMap.values());
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const result = await db
      .select()
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .leftJoin(users, eq(orderItems.sellerId, users.id))
      .where(eq(orders.id, id));

    if (result.length === 0) return undefined;

    const orderData = result[0].orders;
    const items = result
      .filter(r => r.order_items && r.products && r.users)
      .map(r => ({
        ...r.order_items!,
        product: r.products!,
        seller: r.users!
      }));

    return {
      ...orderData,
      items
    };
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]> {
    const newItems = await db
      .insert(orderItems)
      .values(items)
      .returning();
    return newItems;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }
}

export const storage = new DatabaseStorage();
