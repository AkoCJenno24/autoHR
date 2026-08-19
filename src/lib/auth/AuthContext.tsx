import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase/config';
import { User, Organization, OrgMembership } from '@/types';
import { db } from '@/lib/db';
import {
  getOrgBySlug,
  getUserInOrg,
  resolveUserOrg,
  createOrganization,
} from '@/lib/firebase/firestore';

// ─── Local Account Persistence for Mock / Offline SaaS Mode ──────────────────

interface LocalAccount {
  uid: string;
  email: string;
  password?: string;
  displayName: string;
}

const LOCAL_ACCOUNTS_KEY = 'autohr_saas_accounts_v1';

function getLocalAccounts(): LocalAccount[] {
  try {
    const saved = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalAccount(account: LocalAccount) {
  try {
    const list = getLocalAccounts().filter(a => a.email.toLowerCase() !== account.email.toLowerCase());
    list.push(account);
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(list));
  } catch {}
}

// ─── Context types ─────────────────────────────────────────────────────────

interface RegisterParams {
  fullName: string;
  email: string;
  password: string;
}

interface CreateCompanyParams {
  companyName: string;
  slug: string;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  currentOrg: Organization | null;
  orgMembership: OrgMembership | null;
  /** True when user is authenticated */
  isAuthenticated: boolean;
  /** True when user is authed AND has a company set up */
  hasOrg: boolean;
  loading: boolean;
  authError: string | null;
  /** Step 1 signup: create account only, no company yet */
  register: (params: RegisterParams) => Promise<void>;
  /** Step 2: called from /onboarding to create the company */
  createCompany: (params: CreateCompanyParams) => Promise<void>;
  /** Employee / owner login scoped to a company slug */
  login: (email: string, pass: string, slug?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  reloadProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [orgMembership, setOrgMembership] = useState<OrgMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // ── Error mapping ──
  const mapAuthError = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Wrong email address or password.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Sign in instead.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Contact your HR admin.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Try again later or reset your password.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      case 'auth/invalid-api-key':
        return 'Firebase API key not configured or invalid.';
      default:
        return err?.message || 'Something went wrong. Please try again.';
    }
  };

  // ── Resolve user profile after authentication ──
  const resolveUserProfile = async (fbUser: FirebaseUser | { uid: string; email: string | null; displayName: string | null } | null) => {
    if (!fbUser) {
      setUser(null);
      setCurrentOrg(null);
      setOrgMembership(null);
      return;
    }

    try {
      // 1. Try to resolve org membership from user index
      const membership = await resolveUserOrg(fbUser.uid);

      if (membership) {
        // Org found — fetch the user's profile from the org
        const orgUser = await getUserInOrg(membership.orgId, fbUser.uid);
        if (orgUser) {
          const org = db.getOrganization();
          const orgName = org.id === membership.orgId ? org.name : membership.orgSlug;
          setUser(orgUser);
          setOrgMembership({
            orgId: membership.orgId,
            orgSlug: membership.orgSlug,
            orgName,
          });
          setCurrentOrg(org.id === membership.orgId ? org : { ...org, id: membership.orgId, name: orgName });
          db.setCurrentUser(orgUser.id);
          return;
        }
      }

      // 2. Check local db seed users
      const localUsers = db.getUsers();
      const localMatch = localUsers.find(
        u => u.email.toLowerCase() === (fbUser.email || '').toLowerCase()
      );
      if (localMatch) {
        setUser(localMatch);
        const org = db.getOrganization();
        setCurrentOrg(org);
        setOrgMembership({
          orgId: org.id,
          orgSlug: org.slug || org.code.toLowerCase(),
          orgName: org.name,
        });
        db.setCurrentUser(localMatch.id);
        return;
      }

      // 3. User is authenticated but has no company yet → hasOrg = false → /onboarding
      setUser(null);
      setCurrentOrg(null);
      setOrgMembership(null);
    } catch (e) {
      console.error('Error resolving user profile:', e);
      setUser(null);
      setCurrentOrg(null);
      setOrgMembership(null);
    }
  };

  // ── Auth state listener ──
  useEffect(() => {
    let unsubscribe = () => {};

    if (isFirebaseConfigured) {
      try {
        unsubscribe = onAuthStateChanged(
          auth,
          async (fbUser) => {
            setFirebaseUser(fbUser);
            if (fbUser) {
              await resolveUserProfile(fbUser);
            } else {
              restoreLocalSession();
            }
            setLoading(false);
          },
          (error) => {
            console.warn('Firebase onAuthStateChanged error:', error);
            restoreLocalSession();
            setLoading(false);
          }
        );
      } catch {
        restoreLocalSession();
        setLoading(false);
      }
    } else {
      restoreLocalSession();
      setLoading(false);
    }

    function restoreLocalSession() {
      const saved = localStorage.getItem('autohr_ph_data_v1_2');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.currentUserId) {
            const existing = db.getUsers().find(u => u.id === parsed.currentUserId);
            if (existing) {
              setUser(existing);
              const org = db.getOrganization();
              setCurrentOrg(org);
              setOrgMembership({
                orgId: org.id,
                orgSlug: org.slug || org.code.toLowerCase(),
                orgName: org.name,
              });
              setFirebaseUser({
                uid: existing.id.replace('usr_', ''),
                email: existing.email,
                displayName: existing.displayName,
              } as any);
            }
          }
        } catch {}
      }
    }

    // Subscribe to local datastore changes so role/permission updates reflect immediately
    const dbUnsub = db.subscribe(() => {
      const currentStoredUser = db.getCurrentUser();
      if (currentStoredUser) {
        setUser(currentStoredUser);
      }
    });

    return () => {
      unsubscribe();
      dbUnsub();
    };
  }, []);

  // ── register(): create account, no company yet ──
  const register = async (params: RegisterParams) => {
    setLoading(true);
    setAuthError(null);

    try {
      let uid = `local_${Date.now().toString(36)}`;

      if (isFirebaseConfigured) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, params.email, params.password);
          await updateProfile(cred.user, { displayName: params.fullName });
          setFirebaseUser(cred.user);
          uid = cred.user.uid;
        } catch (fbErr: any) {
          // If Firebase has invalid API key or network error, fallback to mock account seamlessly
          console.warn('Firebase registration fallback to mock:', fbErr.message);
          const fakeUser = {
            uid,
            email: params.email,
            displayName: params.fullName,
          } as FirebaseUser;
          setFirebaseUser(fakeUser);
        }
      } else {
        const fakeUser = {
          uid,
          email: params.email,
          displayName: params.fullName,
        } as FirebaseUser;
        setFirebaseUser(fakeUser);
      }

      saveLocalAccount({
        uid,
        email: params.email,
        password: params.password,
        displayName: params.fullName,
      });

      // User has registered successfully, now hasOrg is false → redirects to /onboarding
    } catch (err: any) {
      const msg = mapAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── createCompany(): called from /onboarding after register() ──
  const createCompany = async (params: CreateCompanyParams) => {
    if (!firebaseUser) throw new Error('You must be registered and logged in to create a company.');
    setLoading(true);
    setAuthError(null);
    try {
      const { org, ownerUser } = await createOrganization({
        slug: params.slug,
        companyName: params.companyName,
        ownerFirebaseUid: firebaseUser.uid,
        ownerDisplayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Company Owner',
        ownerEmail: firebaseUser.email || '',
      });

      setUser(ownerUser);
      setCurrentOrg(org);
      setOrgMembership({
        orgId: org.id,
        orgSlug: params.slug,
        orgName: params.companyName,
      });
      db.setCurrentUser(ownerUser.id);
    } catch (err: any) {
      const msg = err?.message || 'Failed to create company. Please try again.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── login(): slug-aware sign-in ──
  const login = async (email: string, pass: string, slug?: string) => {
    setLoading(true);
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    try {
      let loggedInUid: string | null = null;
      let loggedInDisplayName: string = cleanEmail.split('@')[0];

      // 1. Try Firebase Auth if configured
      if (isFirebaseConfigured) {
        try {
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
          setFirebaseUser(cred.user);
          loggedInUid = cred.user.uid;
          loggedInDisplayName = cred.user.displayName || loggedInDisplayName;
        } catch (fbErr: any) {
          console.warn('Firebase signIn attempt failed, checking local store:', fbErr.message);
        }
      }

      // 2. If not logged in via Firebase, check local accounts & seed users
      if (!loggedInUid) {
        // Check seed users
        const matchedSeed = db.getUsers().find(u => u.email.toLowerCase() === cleanEmail);
        if (matchedSeed) {
          loggedInUid = matchedSeed.id.replace('usr_', '');
          loggedInDisplayName = matchedSeed.displayName;
          setFirebaseUser({
            uid: loggedInUid,
            email: cleanEmail,
            displayName: loggedInDisplayName,
          } as any);
        } else {
          // Check local registered accounts
          const localAcc = getLocalAccounts().find(a => a.email.toLowerCase() === cleanEmail);
          if (localAcc) {
            loggedInUid = localAcc.uid;
            loggedInDisplayName = localAcc.displayName;
            setFirebaseUser({
              uid: localAcc.uid,
              email: cleanEmail,
              displayName: localAcc.displayName,
            } as any);
          }
        }
      }

      // If user still not identified, throw invalid credentials
      if (!loggedInUid) {
        throw new Error('Wrong email address or password.');
      }

      // 3. Resolve organization membership
      if (slug) {
        const orgData = await getOrgBySlug(slug);
        if (orgData) {
          const orgUser = await getUserInOrg(orgData.orgId, loggedInUid);
          if (orgUser) {
            setUser(orgUser);
            setOrgMembership({ orgId: orgData.orgId, orgSlug: slug, orgName: orgData.orgName });
            db.setCurrentUser(orgUser.id);
            return;
          }
        }
      }

      // Fallback: resolve user profile automatically
      await resolveUserProfile({
        uid: loggedInUid,
        email: cleanEmail,
        displayName: loggedInDisplayName,
      });
    } catch (err: any) {
      const msg = mapAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      if (isFirebaseConfigured) {
        await firebaseSignOut(auth);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setFirebaseUser(null);
      setUser(null);
      setCurrentOrg(null);
      setOrgMembership(null);
      localStorage.removeItem('autohr_ph_data_v1_2');
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    try {
      if (isFirebaseConfigured) {
        await sendPasswordResetEmail(auth, email);
      }
    } catch (err: any) {
      const msg = mapAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const reloadProfile = async () => {
    if (firebaseUser) await resolveUserProfile(firebaseUser);
  };

  const clearError = () => setAuthError(null);

  const isAuthenticated = !!firebaseUser || !!user;
  const hasOrg = !!user && !!orgMembership;

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        currentOrg,
        orgMembership,
        isAuthenticated,
        hasOrg,
        loading,
        authError,
        register,
        createCompany,
        login,
        logout,
        resetPassword,
        reloadProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
