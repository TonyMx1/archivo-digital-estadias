'use client';

import { useState } from 'react';
import { Role, SecretariaOption, User } from '@/hooks/useAdminUsers';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface UsersTableProps {
  users: User[];
  roles: Role[];
  secretarias: SecretariaOption[];
  isAdmin: boolean;
  canEditSecretaria: boolean;
  updatingUserId: number | null;
  deletingUserId: number | null;
  onRoleChange: (userId: number, newRoleId: number) => void;
  onSecretariaChange: (userId: number, nomSecre: string | null) => void;
  onDeleteUser: (userId: number, userName: string) => Promise<void>;
  canDeleteUsers: boolean;
}

interface SecretariaSelectProps {
  value: string | null;
  options: SecretariaOption[];
  disabled: boolean;
  onChange: (value: string | null) => void;
}

function SecretariaSelect({
  value,
  options,
  disabled,
  onChange,
}: SecretariaSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = value || 'Sin asignar';

  const handleSelect = (nextValue: string | null) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="flex w-full min-w-[20rem] items-center justify-between gap-3 rounded-base border border-default-medium bg-white px-3 py-3 text-left text-sm text-heading shadow-xs transition-colors hover:border-[#0076aa] disabled:cursor-not-allowed disabled:opacity-60"
          title={selectedLabel}
        >
          <span className="line-clamp-3 whitespace-normal break-words leading-5">
            {selectedLabel}
          </span>
          <svg
            className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[24rem] p-2">
        <div className="max-h-72 space-y-1 overflow-y-auto">
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-[#e9f0f8] ${
              !value ? 'bg-[#d7e7f5] font-semibold text-[#0b3b60]' : 'text-gray-700'
            }`}
          >
            Sin asignar
          </button>
          {options.map((secretaria) => {
            const isSelected = secretaria.nombre_secretaria === value;
            return (
              <button
                key={secretaria.id_secretaria}
                type="button"
                onClick={() => handleSelect(secretaria.nombre_secretaria)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm whitespace-normal break-words leading-5 transition-colors hover:bg-[#e9f0f8] ${
                  isSelected ? 'bg-[#d7e7f5] font-semibold text-[#0b3b60]' : 'text-gray-700'
                }`}
                title={secretaria.nombre_secretaria}
              >
                {secretaria.nombre_secretaria}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function UsersTable({
  users,
  roles,
  secretarias,
  isAdmin,
  canEditSecretaria,
  updatingUserId,
  deletingUserId,
  onRoleChange,
  onSecretariaChange,
  onDeleteUser,
  canDeleteUsers,
}: UsersTableProps) {
  return (
    <div className="relative overflow-x-auto bg-[#f4f7fb] shadow-xs rounded-base border border-default">
      <table className="w-full text-sm text-left rtl:text-right text-body">
        <thead className="text-sm bg-[#0b3b60] text-white border-b rounded-base border-default">
          <tr>
            <th scope="col" className="px-6 py-3 font-medium">Usuario</th>
            <th scope="col" className="px-6 py-3 font-medium">CURP</th>
            <th scope="col" className="px-6 py-3 font-medium min-w-[24rem]">Secretaría</th>
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
                <td className="px-6 py-4">{user.nombre_usuario || '-'}</td>
                <td className="px-6 py-4">{user.curp}</td>
                <td className="px-6 py-4 min-w-[24rem]">
                  {canEditSecretaria ? (
                    <SecretariaSelect
                      value={user.nom_secre}
                      options={secretarias}
                      disabled={updatingUserId === user.id_usuarios}
                      onChange={(value) => onSecretariaChange(user.id_usuarios, value)}
                    />
                  ) : (
                    <span className="block max-w-[24rem] whitespace-normal break-words leading-5">
                      {user.nom_secre || '-'}
                    </span>
                  )}
                </td>
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
                        onChange={(e) => onRoleChange(user.id_usuarios, parseInt(e.target.value, 10))}
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
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 57.828 57.827"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g>
                                <g>
                                  <circle cx="24.87" cy="13.811" r="13.811" />
                                  <path d="M6.972,52.484l9.718,2.56c4.215,1.109,11.004,0.979,15.173-0.293l3.93-1.205c2.209,2.614,5.505,4.281,9.188,4.281 c6.633,0,12.03-5.397,12.03-12.03c0-6.635-5.397-12.032-12.03-12.032c-1.124,0-2.207,0.167-3.239,0.456 c-2.494-3.016-5.696-5.299-9.631-6.58c-2.292,1.345-4.947,2.129-7.791,2.129c-2.857,0-5.527-0.792-7.826-2.149 c-7.347,2.302-12.55,7.888-15.278,15.2C-0.311,46.905,2.757,51.374,6.972,52.484z M44.95,35.346 c5.732,0,10.378,4.646,10.378,10.38c0,5.732-4.646,10.379-10.378,10.379s-10.379-4.646-10.379-10.379 C34.572,39.992,39.217,35.346,44.95,35.346z" />
                                  <path d="M39.138,51.036c0.365,0.402,0.866,0.604,1.37,0.604c0.446,0,0.896-0.16,1.251-0.485l3.19-2.916l3.189,2.916 c0.356,0.325,0.805,0.485,1.251,0.485c0.502,0,1.003-0.203,1.37-0.604c0.691-0.755,0.638-1.93-0.118-2.621l-2.943-2.691 l2.943-2.691c0.756-0.691,0.809-1.864,0.118-2.621c-0.691-0.757-1.864-0.808-2.621-0.118l-3.189,2.918l-3.19-2.918 c-0.757-0.691-1.929-0.638-2.621,0.118c-0.691,0.757-0.639,1.93,0.118,2.621l2.944,2.691l-2.944,2.691 C38.5,49.106,38.448,50.281,39.138,51.036z" />
                                </g>
                              </g>
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
