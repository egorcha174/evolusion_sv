

export type BackgroundEffectType =
    | 'none'
    | 'snow'
    | 'rain'
    | 'aurora'
    | 'clouds'
    | 'sun-glare'
    | 'thunderstorm'
    | 'leaves'
    | 'river'
    | 'tron'
    | 'sun-clouds'
    | 'life'
    | 'matrix'
    | 'hyperspace'
    | 'auto';


export interface AuroraSettings {
    color1: string;
    color2: string;
    color3: string;
    speed: number;
    intensity: number;
    blur: number;
    saturate: number;
    stars: boolean;
    starSpeed: number;
}

export interface TronSettings {
    backgroundColor: string;
    maxBeams: number;
    beamSpeed: number;
    beamColors: string[];
}

export interface LifeSettings {
    backgroundColor: string;
    cellColor: string;
    cellSize: number;
    updateInterval: number;
}

export interface MatrixSettings {
    backgroundColor: string;
    glyphColor: string;
    glowColor: string;
    fontSize: number;
    speed: number;
    fadeStrength: number;
    density: number;
}

export interface HyperspaceSettings {
    backgroundColor: string;
    starColor: string;
    starSpeed: number;
    starDensity: number;
    starTrailLength: number;
    fov: number;
}

export interface BackgroundSettings {
    aurora: AuroraSettings;
    tron: TronSettings;
    life: LifeSettings;
    matrix: MatrixSettings;
    hyperspace: HyperspaceSettings;
}

export interface BackgroundState {
    effectType: BackgroundEffectType;
    userSelectedEffect: BackgroundEffectType;
    settings: BackgroundSettings;
}
