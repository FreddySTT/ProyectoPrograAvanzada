import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPokemonDetail } from "@/features/pokemon/services/pokeApi";
import { PokemonDetailTemplate } from "@/components/templates/PokemonDetailTemplate/PokemonDetailTemplate";
import { formatPokemonName } from "@/features/pokemon/utils/pokemonFormatters";

interface PokemonDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: PokemonDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const pokemon = await fetchPokemonDetail(id);
    const name = formatPokemonName(pokemon.name);

    return {
      title: `${name} ${pokemon.formattedId} — Pokédex`,
      description: `Registro oficial de ${name} (${pokemon.species.genus}). Tipos: ${pokemon.types.join(", ")}. Altura: ${pokemon.height / 10}m, Peso: ${pokemon.weight / 10}kg.`,
      openGraph: {
        title: `${name} ${pokemon.formattedId} — Pokédex Next.js`,
        description: pokemon.species.flavorTextEs || pokemon.species.flavorTextEn,
        images: [
          {
            url: pokemon.sprites.officialArtwork,
            width: 475,
            height: 475,
            alt: name,
          },
        ],
      },
    };
  } catch {
    return {
      title: `Pokémon #${id} — Pokédex`,
      description: "Detalles del Pokémon en la base de datos nacional.",
    };
  }
}

export default async function PokemonDetailPage({ params }: PokemonDetailPageProps) {
  const { id } = await params;

  try {
    const pokemon = await fetchPokemonDetail(id);
    return <PokemonDetailTemplate pokemon={pokemon} />;
  } catch (error) {
    console.error("Error al cargar la página de detalle del Pokémon:", error);
    notFound();
  }
}
