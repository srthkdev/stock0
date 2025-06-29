import { Client, Account, Databases, Storage } from 'appwrite'
import { Client as NodeClient, Account as NodeAccount, Databases as NodeDatabases, Storage as NodeStorage } from 'node-appwrite'

// Client configuration for browser/client-side
export const appwriteConfig = {
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
  storageId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!,
  collectionsId: {
    users: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
  }
}

// Client for browser/client-side operations
export const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)

// Services
export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)

// Server-side client configuration (for API routes and server components)
export const createAdminClient = () => {
  const adminClient = new NodeClient()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setKey(process.env.APPWRITE_API_KEY!)

  return {
    client: adminClient,
    account: new NodeAccount(adminClient),
    databases: new NodeDatabases(adminClient),
    storage: new NodeStorage(adminClient),
  }
}

// Session client for server-side operations with user session
export const createSessionClient = (session: string) => {
  const sessionClient = new NodeClient()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setSession(session)

  return {
    client: sessionClient,
    account: new NodeAccount(sessionClient),
    databases: new NodeDatabases(sessionClient),
    storage: new NodeStorage(sessionClient),
  }
} 