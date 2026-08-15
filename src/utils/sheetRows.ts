import Papa from "papaparse";

export const COLUMN = {
  lugar: 0,
  direccion: 1,
  seNecesitanVoluntarios: 2,
  horarios: 3,
  horaActualizacion: 4,
  notas: 5,
  linkInscripcion: 6,
  contactoClave: 7,
  grupoWhatsapp: 8,
  instagram: 9,
  funcionesVoluntarios: 10,
} as const;

/**
 * La hoja trae un número variable de filas decorativas (título, links,
 * avisos) antes de la fila real de columnas — cambió de 3 a 5 una vez ya
 * durante el desarrollo. En vez de asumir un offset fijo, se busca la fila
 * que literalmente dice "LUGAR" y se toma todo lo que viene después.
 */
export function parseSheetRows(csvText: string): string[][] {
  const { data } = Papa.parse<string[]>(csvText, { skipEmptyLines: false });
  const headerIndex = data.findIndex((row) => row[COLUMN.lugar]?.trim().toUpperCase() === "LUGAR");

  if (headerIndex === -1) {
    throw new Error("No se encontró la fila de encabezado ('LUGAR') en el CSV de la hoja");
  }

  return data.slice(headerIndex + 1).filter((row) => row[COLUMN.lugar]?.trim());
}
