import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon } from '../pokemon/entities/pokemon.entity';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';
@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=350',
    );

    await this.pokemonModel.deleteMany({});

    /**Pool of promises way */
    // const inserPromisesArray = [];
    // data.results.map(async ({ name, url }) => {
    //   const no = Number(url.split('/').at(-2));
    //   inserPromisesArray.push(this.pokemonModel.create({ name, no }));
    // });
    // await Promise.all(inserPromisesArray);

    const pokemonsToInsert = data.results.map(({ name, url }) => {
      const no = Number(url.split('/').at(-2));
      return { name, no };
    });

    await this.pokemonModel.insertMany(pokemonsToInsert);

    return 'Seed executed';
  }
}
