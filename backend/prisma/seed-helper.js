/*
 * If you need to initialize your database with some data, you may write a script
 * to do so here.
 */

import prisma from '../prisma/client.js';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const createUserSchema = z.object({
  utorid: z.string().regex(/^[a-zA-Z0-9]+$/, {
    message: "Value must be alphanumeric",
    })
    .min(7, "utorid must be at least 7 characters long")
    .max(8, "utorid too long"),
  email: z.string()
    .email("Invalid email format")
    .refine(val => val.endsWith("@mail.utoronto.ca"), {
      message: "Email must be of domain @mail.utoronto.ca"
    }),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .max(20, "Password must be at most 20 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  name: z.string().min(1).max(50).optional(),
  role: z.enum(['regular', 'cashier', 'manager', 'superuser']).optional(),
  verified: z.boolean().optional(),
  suspicious: z.boolean().optional(),
});

/**
 * Creates a user 
 */


async function createUser(userData) {
  // Validate input data
  let validatedData;
  try {
    validatedData = createUserSchema.parse(userData);
  } catch (err) {
    const errors = err.errors.map(e => `${e.path.join('.')} - ${e.message}`);
    throw new Error(`Validation error(s):\n${errors.join('\n')}`);
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(validatedData.password, 10);

  // Check for existing user
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: validatedData.email },
        { utorid: validatedData.utorid }
      ]
    }
  });

  if (existingUser) {
    const duplicatedField = existingUser.utorid === validatedData.utorid ? "utorid" : 'email';
    throw new Error(`${duplicatedField} already exists`);
  }

  // Create the user
  const user = await prisma.user.create({
    data: {
      utorid: validatedData.utorid,
      email: validatedData.email,
      password: hashedPassword,
      name: validatedData.name,
      role: validatedData.role || 'regular',
      verified: validatedData.verified || false,
      suspicious: validatedData.suspicious || false,
    },
  });

  return user;
}

async function createEvents(eventData){
  
  //not checking for errors due to hardcoded data in seed files
  const event = await prisma.event.create({
    data: eventData
  });

  return event;
}

async function createEventOrganizer(organizerData){
  //not checking for errors due to hardcoded data in seed files
  const organizer = await prisma.eventOrganizer.create({
    data: organizerData
  });

  return organizer;
}

async function createEventGuest(guestData){
  //not checking for errors due to hardcoded data in seed files
  const guest = await prisma.eventGuest.create({
    data: guestData
  });

  return guest;
}

async function createPromotions(promotionData){
  
  //not checking for errors due to hardcoded data in seed files
  const promotion = await prisma.promotion.create({
    data: promotionData
  });

  return promotion;
}

async function createTransaction(transactionData){
  const { promotions, ...txFields } = transactionData;
  
  // Use a transaction to ensure both the transaction record and points update happen together
  const result = await prisma.$transaction(async (tx) => {
    // Handle transfer
    if (txFields.type === 'transfer') {
      const senderId = txFields.userId;
      const receiverId = txFields.relatedUserId;
      const pointAmount = Math.abs(txFields.amount);
      
      // Create sender transaction
      const senderTransaction = await tx.transaction.create({
        data: {
          type: 'transfer',
          amount: -pointAmount,
          remark: txFields.remark ?? null,
          userId: senderId,
          createdById: txFields.createdById,
          relatedUserId: receiverId,
          createdAt: txFields.createdAt
        }
      });
      
      // Create receiver transaction (positive amount)
      const receiverTransaction = await tx.transaction.create({
        data: {
          type: 'transfer',
          amount: pointAmount,
          remark: txFields.remark ?? null,
          userId: receiverId,
          createdById: txFields.createdById,
          relatedUserId: senderId,
          createdAt: txFields.createdAt
        }
      });
      
      // Link transactions to each other
      await tx.transaction.update({
        where: { id: senderTransaction.id },
        data: { relatedTransactionId: receiverTransaction.id }
      });

      await tx.transaction.update({
        where: { id: receiverTransaction.id },
        data: { relatedTransactionId: senderTransaction.id }
      });
      
      // Update both users' points
      await tx.user.update({
        where: { id: senderId },
        data: { points: { decrement: pointAmount } }
      });
      await tx.user.update({
        where: { id: receiverId },
        data: { points: { increment: pointAmount } }
      });
      
      return senderTransaction;
    }
    
    // Handle all other transaction types
    const transaction = await tx.transaction.create({
      data: {
        ...txFields,
        promotions: promotions ? {
          create: promotions.map(promoId => ({
            promotion: { connect: { id: promoId } }
          }))
        } : undefined
      }
    });

    // Update user points for all types EXCEPT redemption which is pending
    if (transaction.type !== 'redemption' && 
        transaction.amount !== null && 
        transaction.amount !== undefined && 
        transaction.userId) {
      await tx.user.update({
        where: { id: transaction.userId },
        data: { points: { increment: transaction.amount } }
      });
    }

    return transaction;
  });

  return result;
}

async function createTransactionPromotion(transactionPromotionData){
  //not checking for errors due to hardcoded data in seed files
  const transactionPromotion = await prisma.transactionPromotion.create({
    data: transactionPromotionData
  });

  return transactionPromotion;
}

export { createUser, createEvents, createPromotions, createTransaction, createTransactionPromotion, createEventOrganizer, createEventGuest, prisma };