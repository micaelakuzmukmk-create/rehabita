// Trazos de la figura humana de línea ReHabita.
// Contorno continuo (no stickman): el volumen se sugiere con doble línea y curvas.

// ---------- Vista lateral (perfil derecho) ----------
// Origen en la cadera (0,0). Rodilla en y=94, tobillo en y=180.
export const SIDE = {
  torso:
    'M -2 10 C -14 2 -16 -20 -12 -44 C -9 -66 -4 -80 3 -89 C 7 -95 16 -95 20 -87 C 25 -76 22 -56 19 -40 C 16 -22 14 -6 12 4 C 8 14 2 16 -2 10 Z',
  pelvis: 'M -13 -2 C -4 -10 8 -9 15 -1',
  neck: 'M 4 -88 C 3 -96 3 -101 4 -105 M -6 -85 C -7 -94 -6 -100 -5 -105',
  head:
    'M 4 -105 C -1 -115 0 -131 9 -136 C 18 -141 28 -133 29 -122 C 30 -116 32 -113 30 -110 C 28 -107 21 -108 18 -111 C 14 -106 6 -103 4 -105 Z',
  thigh:
    'M -12 -2 C -15 10 -15 40 -13 66 C -12 84 -9 94 -3 96 L 3 96 C 10 94 13 84 14 66 C 16 40 16 10 12 -2 C 5 -8 -5 -8 -12 -2 Z',
  shin:
    'M -8 0 C -13 10 -16 30 -15 50 C -14 68 -9 80 -6 86 L 6 86 C 9 78 12 62 11 44 C 10 26 9 10 8 0 C 3 -4 -3 -4 -8 0 Z',
  foot: 'M -9 -1 C -15 3 -15 10 -10 13 L 20 15 C 26 15 28 10 23 7 L 4 -2 C 0 -3 -6 -3 -9 -1 Z',
  upperArm: 'M -6 -3 C -10 5 -10 20 -9 32 L 7 32 C 9 20 9 5 6 -3 C 2 -7 -2 -7 -6 -3 Z',
  foreArm: 'M -5 0 C -8 7 -8 20 -7 30 L 5 30 C 7 20 8 7 6 0 C 2 -5 -2 -5 -5 0 Z',
  hand: 'M -7 30 C -9 36 -6 41 0 41 C 6 41 8 36 6 30',
  kneeLine: 'M -8 2 C -3 -4 4 -4 9 2',
  knee: { y: 94, ankle: 86 },
};

// ---------- Vista frontal ----------
// Origen en la pelvis (0,0). Rodilla en y=98, tobillo en y=190.
export const FRONT = {
  torso:
    'M -27 -92 C -35 -86 -33 -64 -27 -44 C -23 -26 -22 -8 -21 6 C -10 14 10 14 21 6 C 22 -8 23 -26 27 -44 C 33 -64 35 -86 27 -92 C 10 -100 -10 -100 -27 -92 Z',
  pelvis: 'M -20 2 C -10 10 10 10 20 2',
  neck: 'M -7 -98 L -6 -110 M 7 -98 L 6 -110',
  head: 'M 0 -110 C -13 -110 -18 -124 -14 -136 C -10 -146 10 -146 14 -136 C 18 -124 13 -110 0 -110 Z',
  thigh:
    'M -13 -4 C -17 10 -17 44 -15 70 C -14 88 -10 96 -4 98 L 4 98 C 10 96 14 88 15 70 C 17 44 17 10 13 -4 C 5 -10 -5 -10 -13 -4 Z',
  shin:
    'M -12 0 C -15 12 -15 46 -13 72 C -12 84 -9 90 -4 92 L 4 92 C 9 90 12 84 13 72 C 15 46 15 12 12 0 C 4 -5 -4 -5 -12 0 Z',
  foot: 'M -10 0 C -14 5 -13 12 -7 14 L 7 14 C 13 12 14 5 10 0 C 4 -4 -4 -4 -10 0 Z',
  upperArm: 'M -7 -2 C -11 8 -11 26 -10 42 L 7 42 C 9 26 9 8 5 -2 C 1 -6 -3 -6 -7 -2 Z',
  foreArm: 'M -6 0 C -9 10 -9 26 -8 38 L 6 38 C 8 26 8 10 5 0 Z',
  hand: 'M -8 38 C -9 44 -6 48 0 48 C 6 48 9 44 8 38',
  kneeLine: 'M -9 2 C -3 -4 3 -4 9 2',
  knee: { y: 98, ankle: 92 },
};

export const FIGURE_COLORS = {
  ink: '#3B1A7B',
  muted: '#A8A2BB',
  cyan: '#22E2ED',
  cyanDeep: '#2CB1D2',
  soft: '#89D4E6',
};