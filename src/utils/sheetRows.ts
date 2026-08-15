import Papa from "papaparse";

/**
 * La hoja trae 3 filas de encabezado decorativo antes de la fila
 * real de columnas (título, link al mapa, link a Gemini).
 */
const HEADER_ROW_COUNT = 4;

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

export function parseSheetRows(csvText: string): string[][] {
  const { data } = Papa.parse<string[]>(csvText, { skipEmptyLines: false });
  return data.slice(HEADER_ROW_COUNT).filter((row) => row[COLUMN.lugar]?.trim());
}
