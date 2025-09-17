#!/usr/bin/env node

/**
 * Migration script to sync existing Purchase data to UserSubscription table
 * This fixes the issue where successful payments were recorded in Purchase table
 * but subscription status endpoint was checking UserSubscription table
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateData() {
  console.log('🔄 Starting migration of Purchase data to UserSubscription table...');
  
  try {
    // Find all active subscription purchases
    const activePurchases = await prisma.purchase.findMany({
      where: {
        type: 'SUBSCRIPTION',
        status: 'active',
        userId: { not: null }
      },
      include: {
        user: true
      }
    });
    
    console.log(`📋 Found ${activePurchases.length} active subscription purchases to migrate`);
    
    if (activePurchases.length === 0) {
      console.log('✅ No purchases found to migrate');
      return;
    }
    
    // Ensure we have a default subscription plan
    let defaultPlan = await prisma.subscriptionPlan.findFirst({
      where: { active: true }
    });
    
    if (!defaultPlan) {
      console.log('🔧 Creating default subscription plan...');
      defaultPlan = await prisma.subscriptionPlan.create({
        data: {
          name: 'Premium Monthly',
          slug: 'premium-monthly',
          description: 'Premium subscription plan',
          price: 29.99,
          currency: 'USD',
          interval: 'MONTH',
          features: { access: 'premium', downloads: 'unlimited' },
          active: true,
        }
      });
    }
    
    console.log(`📋 Using subscription plan: ${defaultPlan.name} (ID: ${defaultPlan.id})`);
    
    // Migrate each purchase
    let migrated = 0;
    let skipped = 0;
    
    for (const purchase of activePurchases) {
      if (!purchase.userId) {
        console.log(`⚠️  Skipping purchase ${purchase.id} - no user ID`);
        skipped++;
        continue;
      }
      
      try {
        // Check if subscription already exists
        const existingSubscription = await prisma.userSubscription.findFirst({
          where: {
            userId: purchase.userId,
            paymentId: purchase.subscriptionId || purchase.id,
          }
        });
        
        if (existingSubscription) {
          console.log(`⏭️  UserSubscription already exists for purchase ${purchase.id}`);
          skipped++;
          continue;
        }
        
        // Create UserSubscription
        await prisma.userSubscription.create({
          data: {
            userId: purchase.userId,
            planId: defaultPlan.id,
            status: 'ACTIVE',
            paymentId: purchase.subscriptionId || purchase.id,
            paymentMethod: 'stripe',
            amount: defaultPlan.price,
            autoRenew: true,
            startDate: purchase.createdAt,
          }
        });
        
        console.log(`✅ Migrated purchase ${purchase.id} for user ${purchase.user?.email}`);
        migrated++;
        
      } catch (error) {
        console.error(`❌ Failed to migrate purchase ${purchase.id}:`, error);
      }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Migrated: ${migrated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📋 Total: ${activePurchases.length}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateData()
  .then(() => {
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });