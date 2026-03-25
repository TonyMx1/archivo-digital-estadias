import { getDependenciasBySecretaria, getSecretarias, getUserById } from "@/lib/db";

const GLOBAL_DOCUMENT_ACCESS_ROLE_IDS = new Set([1, 2]);

type SecretariaRecord = {
  id_secretaria: number;
  nombre_secretaria: string;
  sec_nomcl?: string | null;
};

type DependenciaRecord = {
  id_dependencia: number;
  nombre_dependencia: string;
  dep_nomcl?: string | null;
};

type UserRecord = {
  id_usuarios: number;
  nom_secre?: string | null;
  nom_dependencia?: string | null;
};

export class DocumentScopeError extends Error {
  status: number;

  constructor(message: string, status = 403) {
    super(message);
    this.name = "DocumentScopeError";
    this.status = status;
  }
}

function normalizeCatalogName(value: string | null | undefined) {
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

function matchesCatalogEntry(
  candidates: Array<string | null | undefined>,
  value: string
) {
  const normalizedValue = normalizeCatalogName(value);
  if (!normalizedValue) {
    return false;
  }

  return candidates
    .filter((candidate): candidate is string => Boolean(candidate))
    .some((candidate) => normalizeCatalogName(candidate) === normalizedValue);
}

function matchesSecretariaName(secretaria: SecretariaRecord, value: string) {
  return matchesCatalogEntry(
    [secretaria.nombre_secretaria, secretaria.sec_nomcl],
    value
  );
}

function matchesDependenciaName(dependencia: DependenciaRecord, value: string) {
  return matchesCatalogEntry(
    [dependencia.nombre_dependencia, dependencia.dep_nomcl],
    value
  );
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
      allowedDependenciaId: null,
      allowedDependenciaName: null,
    };
  }

  const user = (await getUserById(idUsuarios)) as UserRecord | null;

  if (!user) {
    throw new DocumentScopeError("Usuario no encontrado", 401);
  }

  if (!user.nom_secre?.trim()) {
    throw new DocumentScopeError(
      "Tu usuario no tiene una secretaria asignada. Contacta al administrador."
    );
  }

  const secretarias = (await getSecretarias()) as SecretariaRecord[];
  const allowedSecretaria = secretarias.find((secretaria) =>
    matchesSecretariaName(secretaria, user.nom_secre as string)
  );

  if (!allowedSecretaria) {
    throw new DocumentScopeError(
      `La secretaria asignada a tu usuario no existe en el catalogo: ${user.nom_secre}`
    );
  }

  let allowedDependenciaId: number | null = null;
  let allowedDependenciaName: string | null = null;

  if (user.nom_dependencia?.trim()) {
    const dependencias = (await getDependenciasBySecretaria(
      Number(allowedSecretaria.id_secretaria)
    )) as DependenciaRecord[];

    const allowedDependencia = dependencias.find((dependencia) =>
      matchesDependenciaName(dependencia, user.nom_dependencia as string)
    );

    if (!allowedDependencia) {
      throw new DocumentScopeError(
        `La dependencia asignada a tu usuario no existe en el catalogo: ${user.nom_dependencia}`
      );
    }

    allowedDependenciaId = Number(allowedDependencia.id_dependencia);
    allowedDependenciaName = allowedDependencia.nombre_dependencia;
  }

  return {
    restricted: true as const,
    user,
    allowedSecretariaId: Number(allowedSecretaria.id_secretaria),
    allowedSecretariaName: allowedSecretaria.nombre_secretaria,
    allowedDependenciaId,
    allowedDependenciaName,
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

export function canAccessDocumentDependencia(
  idRol: number,
  documentoDependenciaId: number | null | undefined,
  allowedDependenciaId: number | null
) {
  if (hasGlobalDocumentAccess(idRol)) {
    return true;
  }

  if (!allowedDependenciaId) {
    return true;
  }

  if (!documentoDependenciaId) {
    return false;
  }

  return Number(documentoDependenciaId) === Number(allowedDependenciaId);
}
