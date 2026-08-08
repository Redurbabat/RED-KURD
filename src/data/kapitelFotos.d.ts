// Form der generierten Kapitelfotos für TypeScript. Inhalt: kapitelFotos.js.
// Nicht jedes Kapitel hat ein Foto — deshalb `Partial`, damit ein Zugriff
// ehrlich `Kapitelfoto | undefined` ergibt.
import type { Kapitelfoto } from '../types/kurs'

export declare const kapitelFotos: Readonly<Partial<Record<string, Kapitelfoto>>>
