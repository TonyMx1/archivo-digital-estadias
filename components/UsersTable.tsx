'use client';

import { useEffect } from 'react';
import { Dropdown, DropdownItem, Select } from 'flowbite-react';
import { Role, SecretariaOption, User } from '@/hooks/useAdminUsers';
import { useDependencias } from '@/hooks/useDependencias';

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
  onDependenciaChange: (userId: number, nomDependencia: string) => void;
  onDeleteUser: (userId: number, userName: string) => Promise<void>;
  canDeleteUsers: boolean;
}

interface WrappedDropdownProps {
  value: string | null;
  placeholder: string;
  options: string[];
  disabled: boolean;
  onSelect: (value: string) => void;
}

interface SecretariaSelectProps {
  value: string | null;
  options: SecretariaOption[];
  disabled: boolean;
  onChange: (value: string | null) => void;
}

interface DependenciaSelectProps {
  value: string | null;
  secretariaId: number | null;
  disabled: boolean;
  onChange: (value: string) => void;
}

function WrappedDropdown({
  value,
  placeholder,
  options,
  disabled,
  onSelect,
}: WrappedDropdownProps) {
  const selectedLabel = value || placeholder;

  return (
    <Dropdown
      inline
      placement="bottom-start"
      dismissOnClick
      className="w-[28rem] max-h-72 overflow-y-auto"
      renderTrigger={() => (
        <button
          type="button"
          disabled={disabled}
          className="flex w-full items-start justify-between gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm text-slate-900 shadow-sm transition-colors hover:border-[#0076aa] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          title={selectedLabel}
        >
          <span className="line-clamp-2 whitespace-normal leading-5">
            {selectedLabel}
          </span>
          <svg
            className="mt-1 h-4 w-4 shrink-0 text-gray-500"
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
      )}
    >
      {options.map((option, index) => (
        <DropdownItem
          key={`${option || '__empty__'}-${index}`}
          onClick={() => onSelect(option)}
          className="!whitespace-normal !py-2 !leading-5"
          title={option || placeholder}
        >
          {option || placeholder}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}

function SecretariaSelect({
  value,
  options,
  disabled,
  onChange,
}: SecretariaSelectProps) {
  const secretariaOptions = ['', ...options.map((secretaria) => secretaria.nombre_secretaria)];

  return (
    <WrappedDropdown
      value={value}
      placeholder="Sin asignar"
      options={secretariaOptions}
      disabled={disabled}
      onSelect={(selectedValue) => onChange(selectedValue || null)}
    />
  );
}

function DependenciaSelect({
  value,
  secretariaId,
  disabled,
  onChange,
}: DependenciaSelectProps) {
  const { dependencias, loading, fetchDependencias } = useDependencias(secretariaId || 0);
  const hasSecretaria = Boolean(secretariaId);

  useEffect(() => {
    if (secretariaId) {
      fetchDependencias();
    }
  }, [secretariaId, fetchDependencias]);

  const dependenciaOptions = hasSecretaria
    ? ['', ...dependencias.map((dependencia) => dependencia.nombre_dependencia)]
    : [];

  if (hasSecretaria && value && !dependenciaOptions.includes(value)) {
    dependenciaOptions.push(value);
  }

  const placeholder = !hasSecretaria
    ? 'Selecciona primero una secretaria'
    : loading
      ? 'Cargando dependencias...'
      : 'Selecciona una dependencia';

  return (
    <WrappedDropdown
      value={value}
      placeholder={placeholder}
      options={dependenciaOptions}
      disabled={disabled || loading || !hasSecretaria}
      onSelect={onChange}
    />
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
  onDependenciaChange,
  onDeleteUser,
  canDeleteUsers,
}: UsersTableProps) {
  return (
    <div className="relative overflow-x-auto bg-[#f4f7fb] shadow-xs rounded-base border border-default">
      <table className="w-full text-sm text-left rtl:text-right text-body">
        <thead className="text-sm bg-[#0b3b60] text-white border-b rounded-base border-default">
          <tr>
            <th scope="col" className="px-6 py-3 font-medium">Usuario</th>
            <th scope="col" className="px-6 py-3 font-medium min-w-[24rem]">Secretaria</th>
            <th scope="col" className="px-6 py-3 font-medium min-w-[24rem]">Dependencia</th>
            <th scope="col" className="px-6 py-3 font-medium">Rol / Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr className="bg-[#f4f7fb] border-b border-default">
              <td colSpan={4} className="px-6 py-4 text-center">
                No hay usuarios registrados
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.id_usuarios}
                className="bg-[#f4f7fb] border-b border-default hover:bg-[#e9f0f8] transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">
                    {user.nombre_usuario || '-'}
                  </div>
                  <div className="mt-1 text-xs font-mono text-slate-500">
                    {user.curp}
                  </div>
                </td>
                <td className="px-6 py-4 min-w-[24rem]">
                  {canEditSecretaria ? (
                    <SecretariaSelect
                      value={user.nom_secre}
                      options={secretarias}
                      disabled={updatingUserId === user.id_usuarios}
                      onChange={(selectedValue) => onSecretariaChange(user.id_usuarios, selectedValue)}
                    />
                  ) : (
                    <span className="block max-w-[24rem] whitespace-normal break-words leading-5">
                      {user.nom_secre || '-'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 min-w-[24rem]">
                  {canEditSecretaria ? (
                    <DependenciaSelect
                      value={user.nom_dependencia}
                      secretariaId={secretarias.find((item) => item.nombre_secretaria === user.nom_secre)?.id_secretaria || null}
                      disabled={updatingUserId === user.id_usuarios}
                      onChange={(selectedValue) => onDependenciaChange(user.id_usuarios, selectedValue)}
                    />
                  ) : (
                    <span className="block max-w-[24rem] whitespace-normal break-words leading-5">
                      {user.nom_dependencia || '-'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Select
                      value={user.id_rol || ''}
                      onChange={(e) => {
                        const newRoleId = Number(e.target.value);
                        if (newRoleId && newRoleId !== user.id_rol) {
                          onRoleChange(user.id_usuarios, newRoleId);
                        }
                      }}
                      disabled={!isAdmin || updatingUserId === user.id_usuarios}
                      sizing="sm"
                      className="w-44"
                    >
                      {roles.map((role) => (
                        <option key={role.id_roles} value={role.id_roles}>
                          {role.rol}
                        </option>
                      ))}
                    </Select>
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
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
