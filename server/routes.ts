import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProductSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

// Initialize Stripe (only if key is available)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil",
    })
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const { category, search, featured, limit = "20", offset = "0" } = req.query;
      
      const products = await storage.getProducts({
        category: category as string,
        search: search as string,
        featured: featured === "true",
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Increment view count
      await storage.incrementProductViews(id);
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productData = insertProductSchema.parse({
        ...req.body,
        sellerId: userId,
      });
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.get('/api/my-products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const products = await storage.getProductsByUser(userId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching user products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Review routes
  app.get('/api/products/:id/reviews', async (req, res) => {
    try {
      const { id } = req.params;
      const reviews = await storage.getProductReviews(id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/products/:id/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        productId: id,
        buyerId: userId,
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Cart routes
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { productId, quantity = 1 } = req.body;
      
      const cartItem = await storage.addToCart({
        userId,
        productId,
        quantity,
      });
      
      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put('/api/cart/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      
      const cartItem = await storage.updateCartItem(id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.removeFromCart(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          message: "Payment processing is not configured. Please contact support." 
        });
      }

      const userId = req.user.claims.sub;
      const { amount, cartItemIds } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          userId,
          cartItemIds: JSON.stringify(cartItemIds),
        },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post('/api/create-order', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { cartItemIds, shippingAddress, paymentIntentId } = req.body;
      
      // Get cart items
      const cartItems = await storage.getCartItems(userId);
      const validCartItems = cartItems.filter(item => 
        cartItemIds.includes(item.id)
      );
      
      if (validCartItems.length === 0) {
        return res.status(400).json({ message: "No valid cart items found" });
      }
      
      // Calculate total
      let totalAmount = 0;
      let totalCarbonSaved = 0;
      
      const orderItemsData = validCartItems.map(item => {
        const itemTotal = parseFloat(item.product.price) * item.quantity;
        totalAmount += itemTotal;
        totalCarbonSaved += parseFloat(item.product.carbonSaved) * item.quantity;
        
        return {
          productId: item.product.id,
          sellerId: item.product.sellerId,
          price: item.product.price,
          quantity: item.quantity,
          carbonSaved: item.product.carbonSaved,
        };
      });
      
      // Create order
      const order = await storage.createOrder({
        buyerId: userId,
        totalAmount: totalAmount.toString(),
        shippingAddress,
        paymentIntentId,
        totalCarbonSaved: totalCarbonSaved.toString(),
        status: 'confirmed',
      });
      
      // Create order items
      const orderItems = await storage.createOrderItems(
        orderItemsData.map(item => ({
          ...item,
          orderId: order.id,
        }))
      );
      
      // Update user's total carbon saved
      await storage.updateUserCarbonSaved(userId, totalCarbonSaved);
      
      // Clear cart items
      for (const cartItemId of cartItemIds) {
        await storage.removeFromCart(cartItemId);
      }
      
      res.status(201).json({ orderId: order.id });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
