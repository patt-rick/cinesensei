import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { Title, WatchlistItem, UserRating, UserProfile } from "./types";

// User profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function upsertUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const ref = doc(db, "users", uid);
  await setDoc(ref, { uid, ...data }, { merge: true });
}

// Watchlist
export async function getWatchlist(uid: string): Promise<WatchlistItem[]> {
  const ref = collection(db, "users", uid, "watchlist");
  const q = query(ref, orderBy("addedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as WatchlistItem);
}

export async function addToWatchlist(uid: string, title: Title): Promise<void> {
  const ref = doc(db, "users", uid, "watchlist", title.id);
  const item: WatchlistItem = {
    id: title.id,
    titleId: title.id,
    title,
    addedAt: Date.now(),
    status: "plan_to_watch",
  };
  await setDoc(ref, item);
}

export async function removeFromWatchlist(uid: string, titleId: string): Promise<void> {
  const ref = doc(db, "users", uid, "watchlist", titleId);
  await deleteDoc(ref);
}

export async function updateWatchlistStatus(
  uid: string,
  titleId: string,
  status: WatchlistItem["status"]
): Promise<void> {
  const ref = doc(db, "users", uid, "watchlist", titleId);
  await setDoc(ref, { status }, { merge: true });
}

// Ratings
export async function getUserRatings(uid: string): Promise<UserRating[]> {
  const ref = collection(db, "users", uid, "ratings");
  const snap = await getDocs(ref);
  return snap.docs.map((d) => d.data() as UserRating);
}

export async function rateTitle(uid: string, titleId: string, rating: number): Promise<void> {
  const ref = doc(db, "users", uid, "ratings", titleId);
  await setDoc(ref, { titleId, rating, ratedAt: Date.now() });
}

// Cached titles
export async function getCachedTitle(titleId: string): Promise<Title | null> {
  const ref = doc(db, "titles", titleId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  // Check TTL (24h)
  const age = Date.now() - (data.cachedAt || 0);
  if (age > 24 * 60 * 60 * 1000) return null;
  return data as Title;
}

export async function cacheTitle(title: Title): Promise<void> {
  const ref = doc(db, "titles", title.id);
  await setDoc(ref, { ...title, cachedAt: Date.now() });
}
