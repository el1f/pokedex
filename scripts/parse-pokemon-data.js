const fs = require('fs');
const csv = require('csvtojson');
const pathToPokemonCsv = './data/csv/pokemon.csv';
const pathToTypesCsv = './data/csv/types.csv';
const pathToPkmnToTypesCsv = "./data/csv/pokemon_types.csv";
const pathToPkmnSpeciesCsv = "./data/csv/pokemon_species.csv";

const getGame = (id, isSprite) => {
  if (isSprite && id < 650) {
    return 'black-white';
  }
  if (id < 722) {
    return 'x-y';
  }
  return 'ultra-sun-ultra-moon';
};

async function parsePokemonData() {
  const pokemon = await csv()
    .fromFile(pathToPokemonCsv)
    .subscribe(resultRow => {
      var name = resultRow.identifier;
      delete resultRow.identifier;
      resultRow.name = name;
      resultRow.sprites = {
        icon: `http://img.pokemondb.net/sprites/sun-moon/icon/${name}.png`,
        sprite: {
          normal: `http://img.pokemondb.net/sprites/${getGame(
            resultRow.id,
            true
          )}/normal/${name}.png`,
          animated: `http://img.pokemondb.net/sprites/${getGame(
            resultRow.id,
            true
          )}/anim/normal/${name}.gif`
        },
        model: `http://img.pokemondb.net/sprites/${getGame(
          resultRow.id,
          false
        )}/normal/${name}.png`
      };
      resultRow.type = [];
    });
  
  const types = await csv().fromFile(pathToTypesCsv).subscribe(resultRow => {
    var name = resultRow.identifier;
    delete resultRow.identifier;
    resultRow.name = name;
  });
  
  const typeConnections = await csv().fromFile(pathToPkmnToTypesCsv);
  const typedPokemon = [...pokemon];

  typeConnections.map(({ pokemon_id: pkmnId, type_id: typeId, slot }) => {
    if (parseInt(pkmnId) > 1000) return; 
    typedPokemon[parseInt(pkmnId) - 1].type[parseInt(slot - 1)] = types.filter(({id}) => id === typeId)[0].name;
  })
  
  // Add the pokémon family to the items
  const species = await csv().fromFile(pathToPkmnSpeciesCsv);
  const evolutionChains = species.reduce((chains, species) => {
    const chainIndex = parseInt(species.evolution_chain_id) - 1;
    chains[chainIndex] = chains[chainIndex]
      ? [...chains[chainIndex], species.identifier]
      : new Array(species.identifier);
    return chains;
  }, []);

  species.map(({ id, evolution_chain_id: evoId }) => {
    typedPokemon[parseInt(id) - 1].family = evolutionChains[parseInt(evoId) - 1].join("->");
  });

  console.log("Writing pokemon data...");
  return new Promise((resolve, reject) => {
    fs.writeFile("./lib/pokemon.json", JSON.stringify(typedPokemon), error => {
      if (error) {
        reject(error);
      } else {
        resolve("File created");
      }
    });
  });
}

parsePokemonData();