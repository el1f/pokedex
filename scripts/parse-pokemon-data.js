const fs = require('fs');
const csv = require('csvtojson');
const pathToPokemonCsv = './data/csv/pokemon.csv';
const pathToTypesCsv = './data/csv/types.csv';
const pathToPkmnToTypesCsv = "./data/csv/pokemon_types.csv";

const getGame = (id, isSprite) => {
  if (isSprite && id < 650) {
    return 'black-white';
  }
  if (id < 722) {
    return 'x-y';
  }
  return 'ultra-sun-ultra-moon';
};

const getGeneration = (id) => {
  if (id <= 151) return 1;
  if (id <= 251) return 2;
  if (id <= 386) return 3;
  if (id <= 493) return 4;
  if (id <= 649) return 5;
  if (id <= 721) return 6;
  if (id <= 810) return 7;
  return 8;
}

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
      resultRow.generation = getGeneration(resultRow.id);
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