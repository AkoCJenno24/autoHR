/**
 * AutoHR Firestore Multi-Tenant Helpers
 *
 * All data is scoped to /organizations/{orgId}/...
 * A top-level /slugs/{slug} lookup lets the login page resolve orgs by URL slug.
 * Fully supports offline / mock local multi-tenant persistence when real Firebase API keys are not supplied.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { firestore, auth, isFirebaseConfigured } from '@/lib/firebase/config';
import {
  Organization,
  User,
  Employee,
  OrgSlug,
} from '@/types';
import { db } from '@/lib/db';

export type { OrgSlug };

// ─── Local Storage Registry Helpers ──────────────────────────────────────────

const LOCAL_SLUGS_KEY = 'autohr_saas_slugs_v1';
const LOCAL_USER_INDEX_KEY = 'autohr_saas_user_index_v1';

function getLocalSlugs(): Record<string, OrgSlug> {
  try {
    const saved = localStorage.getItem(LOCAL_SLUGS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveLocalSlug(slug: OrgSlug) {
  try {
    const map = getLocalSlugs();
    map[slug.slug.toLowerCase()] = slug;
    localStorage.setItem(LOCAL_SLUGS_KEY, JSON.stringify(map));
  } catch {}
}

function getLocalUserIndex(): Record<string, { orgId: string; orgSlug: string; userId: string; email: string }> {
  try {
    const saved = localStorage.getItem(LOCAL_USER_INDEX_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveLocalUserIndex(uid: string, data: { orgId: string; orgSlug: string; userId: string; email: string }) {
  try {
    const map = getLocalUserIndex();
    map[uid] = data;
    localStorage.setItem(LOCAL_USER_INDEX_KEY, JSON.stringify(map));
  } catch {}
}

// ─── Slug lookup ────────────────────────────────────────────────────────────

/** Resolve an org from its URL slug. Returns null if not found. */
export async function getOrgBySlug(slug: string): Promise<OrgSlug | null> {
  const cleanSlug = slug.toLowerCase().trim();

  // Check built-in demo org
  const org = db.getOrganization();
  const orgCodeSlug = org.code.toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (cleanSlug === 'autohr-ph' || cleanSlug === 'autohr' || cleanSlug === orgCodeSlug || (org.slug && org.slug === cleanSlug)) {
    return {
      orgId: org.id,
      orgName: org.name,
      slug: cleanSlug,
    };
  }

  // Check local storage registry
  const localSlugs = getLocalSlugs();
  if (localSlugs[cleanSlug]) {
    return localSlugs[cleanSlug];
  }

  // If Firebase is configured, try Firestore
  if (isFirebaseConfigured) {
    try {
      const ref = doc(firestore, 'slugs', cleanSlug);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as OrgSlug;
        saveLocalSlug(data);
        return data;
      }
    } catch (e) {
      console.warn('Firestore slug lookup failed:', e);
    }
  }

  return null;
}

/** Check if a slug is available. */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  const result = await getOrgBySlug(slug);
  return result === null;
}

// ─── Organization ────────────────────────────────────────────────────────────

export async function getOrgById(orgId: string): Promise<Organization | null> {
  const currentOrg = db.getOrganization();
  if (currentOrg.id === orgId) return currentOrg;

  if (isFirebaseConfigured) {
    try {
      const snap = await getDoc(doc(firestore, 'organizations', orgId));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Organization;
      }
    } catch {}
  }
  return null;
}

/** Create a new organization and reserve its slug atomically. */
export async function createOrganization(params: {
  slug: string;
  companyName: string;
  ownerFirebaseUid: string;
  ownerDisplayName: string;
  ownerEmail: string;
}): Promise<{ org: Organization; ownerUser: User; ownerEmployee: Employee }> {
  // Always initialize local tenant in db state
  const { organization, ownerUser, ownerEmployee } = db.createCompanyTenant({
    companyName: params.companyName,
    companyCode: params.slug,
    ownerName: params.ownerDisplayName,
    ownerEmail: params.ownerEmail,
    ownerUid: params.ownerFirebaseUid,
  });

  const slugRecord: OrgSlug = {
    orgId: organization.id,
    orgName: organization.name,
    slug: params.slug,
  };
  saveLocalSlug(slugRecord);
  saveLocalUserIndex(params.ownerFirebaseUid, {
    orgId: organization.id,
    orgSlug: params.slug,
    userId: ownerUser.id,
    email: params.ownerEmail,
  });

  // If real Firebase is available, sync to Firestore
  if (isFirebaseConfigured) {
    try {
      const batch = writeBatch(firestore);

      // Org doc
      batch.set(doc(firestore, 'organizations', organization.id), {
        ...organization,
        slug: params.slug,
      });

      // Slug lookup
      batch.set(doc(firestore, 'slugs', params.slug), slugRecord);

      // Owner employee
      batch.set(doc(firestore, 'organizations', organization.id, 'employees', ownerEmployee.id), ownerEmployee);

      // Owner user
      batch.set(doc(firestore, 'organizations', organization.id, 'users', ownerUser.id), {
        ...ownerUser,
        firebaseUid: params.ownerFirebaseUid,
      });

      // Global user index
      batch.set(doc(firestore, 'userIndex', params.ownerFirebaseUid), {
        orgId: organization.id,
        orgSlug: params.slug,
        userId: ownerUser.id,
        email: params.ownerEmail,
      });

      await batch.commit();
    } catch (e) {
      console.warn('Firestore createOrganization sync failed:', e);
    }
  }

  return { org: organization, ownerUser, ownerEmployee };
}

// ─── User resolution ──────────────────────────────────────────────────────────

/** Find a user in a specific org by their Firebase UID. */
export async function getUserInOrg(
  orgId: string,
  firebaseUid: string
): Promise<(User & { firebaseUid: string }) | null> {
  // 1. Check local db
  const localMatch = db.getUsers().find(u => u.id === `usr_${firebaseUid}` || u.id === firebaseUid);
  if (localMatch) {
    return { ...localMatch, firebaseUid };
  }

  // 2. Check Firestore if configured
  if (isFirebaseConfigured) {
    try {
      const q = query(
        collection(firestore, 'organizations', orgId, 'users'),
        where('firebaseUid', '==', firebaseUid),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return { id: d.id, ...d.data() } as User & { firebaseUid: string };
      }
    } catch {}
  }

  return null;
}

/** Find which org a Firebase UID belongs to. */
export async function resolveUserOrg(firebaseUid: string): Promise<{ orgId: string; orgSlug: string } | null> {
  // 1. Check local index
  const localIndex = getLocalUserIndex();
  if (localIndex[firebaseUid]) {
    return {
      orgId: localIndex[firebaseUid].orgId,
      orgSlug: localIndex[firebaseUid].orgSlug,
    };
  }

  // 2. Check local db current user
  const localUsers = db.getUsers();
  const found = localUsers.find(u => u.id === `usr_${firebaseUid}` || u.id === firebaseUid);
  if (found) {
    const org = db.getOrganization();
    return {
      orgId: org.id,
      orgSlug: org.slug || org.code.toLowerCase(),
    };
  }

  // 3. Check Firestore
  if (isFirebaseConfigured) {
    try {
      const snap = await getDoc(doc(firestore, 'userIndex', firebaseUid));
      if (snap.exists()) {
        return snap.data() as { orgId: string; orgSlug: string };
      }
    } catch {}
  }

  return null;
}

// ─── Employee invite / create ─────────────────────────────────────────────────

export interface CreateEmployeeInOrgParams {
  orgId: string;
  orgSlug: string;
  employee: Omit<Employee, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>;
  roleId: string;
  roleType: string;
  roleName: string;
  tempPassword?: string;
  invitedByUserId: string;
}

export async function createEmployeeInOrg(params: CreateEmployeeInOrgParams): Promise<{
  employee: Employee;
  user: User;
}> {
  const now = new Date().toISOString();
  const empId = `emp_${Date.now().toString(36)}`;
  let firebaseUid = `local_${empId}`;

  if (isFirebaseConfigured && params.tempPassword) {
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        params.employee.email,
        params.tempPassword
      );
      firebaseUid = cred.user.uid;

      await updateProfile(cred.user, {
        displayName: `${params.employee.firstName} ${params.employee.lastName}`,
      });

      await sendPasswordResetEmail(auth, params.employee.email);
    } catch (err: any) {
      console.warn('Firebase Auth invite error:', err.message);
    }
  }

  const userId = `usr_${firebaseUid}`;

  const employee: Employee = {
    ...params.employee,
    id: empId,
    organizationId: params.orgId,
    createdAt: now,
    updatedAt: now,
  };

  const user: User = {
    id: userId,
    organizationId: params.orgId,
    employeeId: empId,
    email: params.employee.email,
    displayName: `${params.employee.firstName} ${params.employee.lastName}`,
    roleId: params.roleId,
    roleType: params.roleType as any,
    roleName: params.roleName,
    isActive: true,
    isOwner: false,
  };

  // Add to local database
  db.addEmployee(employee);

  saveLocalUserIndex(firebaseUid, {
    orgId: params.orgId,
    orgSlug: params.orgSlug,
    userId,
    email: params.employee.email,
  });

  // Sync to Firestore if configured
  if (isFirebaseConfigured) {
    try {
      const batch = writeBatch(firestore);
      batch.set(doc(firestore, 'organizations', params.orgId, 'employees', empId), employee);
      batch.set(doc(firestore, 'organizations', params.orgId, 'users', userId), {
        ...user,
        firebaseUid,
      });
      batch.set(doc(firestore, 'userIndex', firebaseUid), {
        orgId: params.orgId,
        orgSlug: params.orgSlug,
        userId,
        email: params.employee.email,
      });
      await batch.commit();
    } catch (e) {
      console.warn('Firestore employee sync failed:', e);
    }
  }

  return { employee, user };
}
