
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
    | 'sun-clouds';

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
}

export interface BackgroundSettings {
    aurora: AuroraSettings;
    tron: TronSettings;
}

export interface BackgroundState {
    effectType: BackgroundEffectType;
    settings: BackgroundSettings;
}
