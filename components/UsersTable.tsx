import { User, Role } from '@/hooks/useAdminUsers';

interface UsersTableProps {
  users: User[];
  roles: Role[];
  isAdmin: boolean;
  updatingUserId: number | null;
  onRoleChange: (userId: number, newRoleId: number) => void;
}

export default function UsersTable({
  users,
  roles,
  isAdmin,
  updatingUserId,
  onRoleChange,
}: UsersTableProps) {
  const handleRoleChange = (userId: number, newRoleId: number) => {
    onRoleChange(userId, newRoleId);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0076aa] text-white">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">CURP</th>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">ID General</th>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">Rol Actual</th>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">Cambiar Rol</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id_usuarios} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.id_usuarios}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.nombre_usuario || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.curp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.id_general}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="px-2 py-1 bg-[#0076aa] text-white rounded text-xs font-semibold">
                      {user.nombre_rol || `Rol ${user.id_rol}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isAdmin ? (
                      <>
                        <select
                          value={user.id_rol}
                          onChange={(e) => handleRoleChange(user.id_usuarios, parseInt(e.target.value))}
                          disabled={updatingUserId === user.id_usuarios}
                          className="px-3 py-2 bg-white border-2 border-[#0076aa] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0076aa] text-sm text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#005a85] transition-colors"
                        >
                          {roles.map((role) => (
                            <option key={role.id_roles} value={role.id_roles}>
                              {role.rol}
                            </option>
                          ))}
                        </select>
                        {updatingUserId === user.id_usuarios && (
                          <span className="ml-2 text-blue-600">Actualizando...</span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400 italic">Solo lectura</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
