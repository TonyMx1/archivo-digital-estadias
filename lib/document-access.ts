import { getSecretarias, getUserById } from "@/lib/db";

const GLOBAL_DOCUMENT_ACCESS_ROLE_IDS = new Set([1, 2]);

type SecretariaRecord = {
  id_secretaria: number;
  nombre_secretaria: string;
  sec_nomcl?: string | null;
};

type UserRecord = {
  id_usuarios: number;
  nom_secre?: string | null;
};

export class DocumentScopeError extends Error {
  status: number;

  constructor(message: string, status = 403) {
    super(message);
    this.name = "DocumentScopeError";
    this.status = status;
  }
}

function normalizeSecretariaName(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function matchesSecretariaName(secretaria: SecretariaRecord, value: string) {
  const normalizedValue = normalizeSecretariaName(value);
  if (!normalizedValue) {
    return false;
  }

  return [secretaria.nombre_secretaria, secretaria.sec_nomcl]
    .filter((candidate): candidate is string => Boolean(candidate))
    .some((candidate) => normalizeSecretariaName(candidate) === normalizedValue);
}

export function hasGlobalDocumentAccess(idRol: number) {
  return GLOBAL_DOCUMENT_ACCESS_ROLE_IDS.has(idRol);
}

export async function getDocumentScopeForUser(idUsuarios: number, idRol: number) {
  if (hasGlobalDocumentAccess(idRol)) {
    return {
      restricted: false as const,
      user: null,
      allowedSecretariaId: null,
      allowedSecretariaName: null,
    };
  }

  const user = (await getUserById(idUsuarios)) as UserRecord | null;

  if (!user) {
    throw new DocumentScopeError("Usuario no encontrado", 401);
  }

  if (!user.nom_secre?.trim()) {
    throw new DocumentScopeError(
      "Tu usuario no tiene una secretaría asignada. Contacta al administrador."
    );
  }

  const secretarias = (await getSecretarias()) as SecretariaRecord[];
  const allowedSecretaria = secretarias.find((secretaria) =>
    matchesSecretariaName(secretaria, user.nom_secre as string)
  );

  if (!allowedSecretaria) {
    throw new DocumentScopeError(
      `La secretaría asignada a tu usuario no existe en el catálogo: ${user.nom_secre}`
    );
  }

  return {
    restricted: true as const,
    user,
    allowedSecretariaId: Number(allowedSecretaria.id_secretaria),
    allowedSecretariaName: allowedSecretaria.nombre_secretaria,
  };
}

export function canAccessDocumentSecretaria(
  idRol: number,
  documentoSecretariaId: number | null | undefined,
  allowedSecretariaId: number | null
) {
  if (hasGlobalDocumentAccess(idRol)) {
    return true;
  }

  if (!allowedSecretariaId || !documentoSecretariaId) {
    return false;
  }

  return Number(documentoSecretariaId) === Number(allowedSecretariaId);
}
