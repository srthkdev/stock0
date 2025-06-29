import { createAdminClient } from '../lib/appwrite/config'
import { ID, Permission, Role, IndexType } from 'node-appwrite'

async function setupDatabase() {
  try {
    const { databases } = createAdminClient()

    console.log('🚀 Setting up Appwrite database and collections...')

    // Use existing database ID from environment
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!
    console.log('📝 Using Database ID:', databaseId)

    // Generate collection IDs
    const usersCollectionId = ID.unique()
    const watchlistCollectionId = ID.unique()
    const portfolioCollectionId = ID.unique()
    const alertsCollectionId = ID.unique()

    console.log('📝 Generated Collection IDs:')
    console.log('  - Users:', usersCollectionId)
    console.log('  - Watchlist:', watchlistCollectionId)
    console.log('  - Portfolio:', portfolioCollectionId)
    console.log('  - Alerts:', alertsCollectionId)

    // Create Users collection (for additional user data)
    try {
      await databases.createCollection(
        databaseId,
        usersCollectionId,
        'Users',
        [
          Permission.read(Role.user('ID')),
          Permission.update(Role.user('ID')),
          Permission.delete(Role.user('ID')),
          Permission.create(Role.users()),
        ]
      )
      console.log('✅ Users collection created')

      // Create attributes for Users collection
      await databases.createStringAttribute(databaseId, usersCollectionId, 'appwriteUserId', 255, true)
      await databases.createStringAttribute(databaseId, usersCollectionId, 'email', 255, true)
      await databases.createStringAttribute(databaseId, usersCollectionId, 'name', 255, false)
      await databases.createStringAttribute(databaseId, usersCollectionId, 'avatar', 2048, false)
      await databases.createStringAttribute(databaseId, usersCollectionId, 'preferences', 1024, false)
      await databases.createDatetimeAttribute(databaseId, usersCollectionId, 'createdAt', true)
      await databases.createDatetimeAttribute(databaseId, usersCollectionId, 'updatedAt', false)

      // Create indexes
      await databases.createIndex(databaseId, usersCollectionId, 'appwriteUserId_index', IndexType.Unique, ['appwriteUserId'])
      await databases.createIndex(databaseId, usersCollectionId, 'email_index', IndexType.Unique, ['email'])

      console.log('✅ Users collection setup completed')
    } catch (error: any) {
      if (error.code === 409) {
        console.log('ℹ️  Users collection already exists')
      } else {
        throw error
      }
    }

    // Create Watchlist collection
    try {
      await databases.createCollection(
        databaseId,
        watchlistCollectionId,
        'Watchlist',
        [
          Permission.read(Role.user('ID')),
          Permission.create(Role.user('ID')),
          Permission.update(Role.user('ID')),
          Permission.delete(Role.user('ID')),
        ]
      )

      await databases.createStringAttribute(databaseId, watchlistCollectionId, 'userId', 255, true)
      await databases.createStringAttribute(databaseId, watchlistCollectionId, 'symbol', 10, true)
      await databases.createStringAttribute(databaseId, watchlistCollectionId, 'name', 255, true)
      await databases.createDatetimeAttribute(databaseId, watchlistCollectionId, 'addedAt', true)
      await databases.createStringAttribute(databaseId, watchlistCollectionId, 'notes', 1000, false)

      await databases.createIndex(databaseId, watchlistCollectionId, 'userId_index', IndexType.Key, ['userId'])
      await databases.createIndex(databaseId, watchlistCollectionId, 'symbol_index', IndexType.Key, ['symbol'])

      console.log('✅ Watchlist collection created')
    } catch (error: any) {
      if (error.code !== 409) throw error
    }

    // Create Portfolio collection
    try {
      await databases.createCollection(
        databaseId,
        portfolioCollectionId,
        'Portfolio',
        [
          Permission.read(Role.user('ID')),
          Permission.create(Role.user('ID')),
          Permission.update(Role.user('ID')),
          Permission.delete(Role.user('ID')),
        ]
      )

      await databases.createStringAttribute(databaseId, portfolioCollectionId, 'userId', 255, true)
      await databases.createStringAttribute(databaseId, portfolioCollectionId, 'symbol', 10, true)
      await databases.createStringAttribute(databaseId, portfolioCollectionId, 'name', 255, true)
      await databases.createFloatAttribute(databaseId, portfolioCollectionId, 'quantity', true)
      await databases.createFloatAttribute(databaseId, portfolioCollectionId, 'avgCost', true)
      await databases.createDatetimeAttribute(databaseId, portfolioCollectionId, 'purchaseDate', true)
      await databases.createStringAttribute(databaseId, portfolioCollectionId, 'notes', 1000, false)

      await databases.createIndex(databaseId, portfolioCollectionId, 'userId_index', IndexType.Key, ['userId'])
      await databases.createIndex(databaseId, portfolioCollectionId, 'symbol_index', IndexType.Key, ['symbol'])

      console.log('✅ Portfolio collection created')
    } catch (error: any) {
      if (error.code !== 409) throw error
    }

    // Create Alerts collection
    try {
      await databases.createCollection(
        databaseId,
        alertsCollectionId,
        'Alerts',
        [
          Permission.read(Role.user('ID')),
          Permission.create(Role.user('ID')),
          Permission.update(Role.user('ID')),
          Permission.delete(Role.user('ID')),
        ]
      )

      await databases.createStringAttribute(databaseId, alertsCollectionId, 'userId', 255, true)
      await databases.createStringAttribute(databaseId, alertsCollectionId, 'symbol', 10, true)
      await databases.createStringAttribute(databaseId, alertsCollectionId, 'type', 50, true) // 'price_above', 'price_below', 'volume_spike'
      await databases.createFloatAttribute(databaseId, alertsCollectionId, 'targetValue', true)
      await databases.createBooleanAttribute(databaseId, alertsCollectionId, 'isActive', true)
      await databases.createDatetimeAttribute(databaseId, alertsCollectionId, 'createdAt', true)
      await databases.createDatetimeAttribute(databaseId, alertsCollectionId, 'triggeredAt', false)
      await databases.createStringAttribute(databaseId, alertsCollectionId, 'notes', 500, false)

      await databases.createIndex(databaseId, alertsCollectionId, 'userId_index', IndexType.Key, ['userId'])
      await databases.createIndex(databaseId, alertsCollectionId, 'symbol_index', IndexType.Key, ['symbol'])
      await databases.createIndex(databaseId, alertsCollectionId, 'active_alerts', IndexType.Key, ['isActive'])

      console.log('✅ Alerts collection created')
    } catch (error: any) {
      if (error.code !== 409) throw error
    }

    console.log('🎉 Database setup completed successfully!')
    console.log('\n📝 Collection IDs to add to your .env.local:')
    console.log(`NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=${usersCollectionId}`)
    console.log(`NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID=${watchlistCollectionId}`)
    console.log(`NEXT_PUBLIC_APPWRITE_PORTFOLIO_COLLECTION_ID=${portfolioCollectionId}`)
    console.log(`NEXT_PUBLIC_APPWRITE_ALERTS_COLLECTION_ID=${alertsCollectionId}`)
    console.log('\n📝 Next steps:')
    console.log('1. Add the above collection IDs to your .env.local file')
    console.log('2. Configure Google OAuth in Appwrite Console')
    console.log('3. Test authentication by running the app')

  } catch (error) {
    console.error('❌ Error setting up database:', error)
    process.exit(1)
  }
}

// Run the setup
if (require.main === module) {
  setupDatabase()
}

export { setupDatabase } 