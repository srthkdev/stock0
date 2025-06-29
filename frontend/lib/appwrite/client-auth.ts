"use client"

import { account } from "./config"

export async function clientSignOut() {
  try {
    // Sign out from Appwrite
    await account.deleteSession("current")
  } catch (error) {
    console.log("Already signed out or session expired")
  }
  
  // Clear all potential cookies client-side
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  
  // Force a hard refresh to clear all state
  window.location.href = "/"
} 