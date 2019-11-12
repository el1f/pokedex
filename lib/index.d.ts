export = Pokedex;

declare class Pokedex {
  pokemon(id: string|number): Pokedex.Pokemon;
}

declare namespace Pokedex {
  export interface Pokemon {
    id: number;
    name: string;
    height?: number;
    weight?: number;
    sprites: {
      icon: string,
      sprite: {
        normal: string,
        animated?: string,
      },
      model?: string,
    };
    species_id?: number;
    base_experience?: number;
    type: string[];
    generation: number;
    order?: number;
    is_default?: number;
  }
}
