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
    <div className="relative overflow-x-auto bg-[#f4f7fb] shadow-xs rounded-base border border-default">
      <table className="w-full text-sm text-left rtl:text-right text-body">
        <thead className="text-sm bg-[#0b3b60] text-white border-b rounded-base border-default">
          <tr>
            <th scope="col" className="px-6 py-3 font-medium">ID</th>
            <th scope="col" className="px-6 py-3 font-medium">Usuario</th>
            <th scope="col" className="px-6 py-3 font-medium">CURP</th>
            <th scope="col" className="px-6 py-3 font-medium">ID General</th>
            <th scope="col" className="px-6 py-3 font-medium">Rol Actual</th>
            <th scope="col" className="px-6 py-3 font-medium">Cambiar Rol / Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr className="bg-[#f4f7fb] border-b border-default">
              <td colSpan={6} className="px-6 py-4 text-center">
                No hay usuarios registrados
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.id_usuarios}
                className="bg-[#f4f7fb] border-b border-default hover:bg-[#e9f0f8] transition-colors"
              >
                <th scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap">
                  {user.id_usuarios}
                </th>
                <td className="px-6 py-4">{user.nombre_usuario || '-'}</td>
                <td className="px-6 py-4">{user.curp}</td>
                <td className="px-6 py-4">{user.id_general}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-[#0076aa] text-white rounded text-xs font-semibold">
                    {user.nombre_rol || `Rol ${user.id_rol}`}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {isAdmin ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={user.id_rol}
                        onChange={(e) => handleRoleChange(user.id_usuarios, parseInt(e.target.value))}
                        disabled={updatingUserId === user.id_usuarios}
                        className="block w-40 px-3 py-1 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:border-[#0076aa] focus:ring-[#0076aa] focus:ring-1 shadow-xs placeholder:text-body"
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
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
  );
}
