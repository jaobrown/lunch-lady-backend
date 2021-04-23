// At it's simplest, access control is a yes or no value

import { permissionsList } from './schemas/fields';
import { ListAccessArgs } from './types';

export function isSignedIn({ session }: ListAccessArgs): boolean {
  return !!session;
}

// Generate permissions functions
const generatedPermissions = Object.fromEntries(
  permissionsList.map((permission) => [
    permission,
    function ({ session }: ListAccessArgs) {
      return !!session?.data?.role?.[permission];
    },
  ])
);

// Permissions check is someone meets a criteria
export const permissions = {
  ...generatedPermissions,
};

// Rule based function

// rules can return bool, or filter
export const rules = {
  canManageProducts({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    // 1. Do they have permission canmanageproduct
    if (permissions.canManageProducts({ session })) {
      return true;
    }
    // 2. If no, do they own it?
    return { user: { id: session.itemId } };
  },
  canOrder({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    // 1. Do they have permission canmanageproduct
    if (permissions.canManageCart({ session })) {
      return true;
    }
    // 2. If no, do they own it?
    return { user: { id: session.itemId } };
  },
  canManageOrderItems({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    // 1. Do they have permission canmanageproduct
    if (permissions.canManageCart({ session })) {
      return true;
    }
    // 2. If no, do they own it?
    return { order: { user: { id: session.itemId } } };
  },
  canReadProducts({ session }: ListAccessArgs) {
    if (permissions.canManageProducts({ session })) {
      return true;
    }
    return { status: 'AVAILABLE' };
  },
  canManageUsers({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    // 1. Do they have permission canmanageproduct
    if (permissions.canManageUsers({ session })) {
      return true;
    }
    // 2. If no, they can only update themselves
    return { id: session.itemId };
  },
};
