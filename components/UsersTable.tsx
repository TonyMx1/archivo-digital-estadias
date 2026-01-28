import { User, Role } from '@/hooks/useAdminUsers';

interface UsersTableProps {
  users: User[];
  roles: Role[];
  isAdmin: boolean;
  updatingUserId: number | null;
  deletingUserId: number | null;
  onRoleChange: (userId: number, newRoleId: number) => void;
  onDeleteUser: (userId: number, userName: string) => Promise<void>;
  canDeleteUsers: boolean;
}

export default function UsersTable({
  users,
  roles,
  isAdmin,
  updatingUserId,
  deletingUserId,
  onRoleChange,
  onDeleteUser,
  canDeleteUsers,
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
              <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">Cambiar Rol  /  Eliminar</th>
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
                      <div className="flex items-center gap-2">
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
                        {canDeleteUsers && (
                          <button
                            onClick={() => onDeleteUser(user.id_usuarios, user.nombre_usuario || `Usuario ${user.id_usuarios}`)}
                            disabled={deletingUserId === user.id_usuarios}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Eliminar usuario"
                          >
                            {deletingUserId === user.id_usuarios ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                // stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10.375 2.25a4.125 4.125 0 1 0 0 8.25 4.125 4.125 0 0 0 0-8.25ZM10.375 12a7.125 7.125 0 0 0-7.124 7.247.75.75 0 0 0 .363.63 13.067 13.067 0 0 0 6.761 1.873c2.472 0 4.786-.684 6.76-1.873a.75.75 0 0 0 .364-.63l.001-.12v-.002A7.125 7.125 0 0 0 10.375 12ZM16 9.75a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5h-6Z"
                                />
                                </svg>
                            )}
                          </button>
                        )}
                        {updatingUserId === user.id_usuarios && (
                          <span className="ml-2 text-blue-600">Actualizando...</span>
                        )}
                      </div>
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
