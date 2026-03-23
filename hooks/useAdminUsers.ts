import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id_usuarios: number;
  curp: string;
  id_general: string;
  id_rol: number;
  nombre_rol: string;
  nombre_usuario: string | null;
  nom_secre: string | null;
}

export interface Role {
  id_roles: number;
  rol: string;
}

export interface SecretariaOption {
  id_secretaria: number;
  nombre_secretaria: string;
  sec_nomcl?: string | null;
}

export function useAdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [secretarias, setSecretarias] = useState<SecretariaOption[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userResponse = await fetch('/api/user');
        if (!userResponse.ok) {
          router.push('/');
          return;
        }

        const userData = await userResponse.json();
        if (!userData.success) {
          router.push('/');
          return;
        }

        const role = userData.user.id_rol;
        setCurrentUserRole(role);

        if (role !== 1 && role !== 2) {
          router.push('/');
          return;
        }

        const adminResponse = await fetch('/api/admin/users');
        if (!adminResponse.ok) {
          setError('No tienes permisos para acceder a esta página');
          setLoading(false);
          return;
        }

        const adminData = await adminResponse.json();
        if (adminData.success) {
          setUsers(adminData.users);
          setRoles(adminData.roles);
          setSecretarias(adminData.secretarias || []);
        } else {
          setError('Error al cargar los datos');
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const updateUserRole = async (userId: number, newRoleId: number) => {
    if (currentUserRole !== 1) {
      throw new Error('Solo los administradores pueden modificar roles');
    }

    const response = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_usuarios: userId,
        id_rol: newRoleId,
      }),
    });

    const data = await response.json();

    if (data.success) {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id_usuarios === userId
            ? { ...user, id_rol: newRoleId, nombre_rol: roles.find((r) => r.id_roles === newRoleId)?.rol || '' }
            : user
        )
      );
      return { success: true };
    }

    throw new Error(data.error || 'Error al actualizar el rol');
  };

  const updateUserSecretaria = async (userId: number, nomSecre: string | null) => {
    if (currentUserRole !== 1 && currentUserRole !== 2) {
      throw new Error('Solo administradores y superusuarios pueden modificar la secretaría');
    }

    const response = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_usuarios: userId,
        nom_secre: nomSecre,
      }),
    });

    const data = await response.json();

    if (data.success) {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id_usuarios === userId ? { ...user, nom_secre: nomSecre } : user
        )
      );
      return { success: true };
    }

    throw new Error(data.error || 'Error al actualizar la secretaría');
  };

  return {
    users,
    roles,
    secretarias,
    currentUserRole,
    loading,
    error,
    updateUserRole,
    updateUserSecretaria,
    isAdmin: currentUserRole === 1,
    canEditSecretaria: currentUserRole === 1 || currentUserRole === 2,
  };
}
