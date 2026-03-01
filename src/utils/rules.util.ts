import { PokemonType } from '../generated/prisma/client'

/**
 * Règles du jeu Pokemon TCG
 * Contient les fonctions pures pour le calcul des dégâts et le système de types
 */

/**
 * Détermine la faiblesse principale d'un type Pokemon défenseur
 * Utilisé pour calculer les bonus de dégâts lors des combats
 *
 * @param {PokemonType} defenderType - Le type du Pokemon qui se défend
 * @returns {PokemonType|null} Le type auquel le défenseur est faible, ou null si aucun
 *
 * @example
 * getWeakness(PokemonType.Fire) // Returns: PokemonType.Water
 * getWeakness(PokemonType.Electric) // Returns: PokemonType.Ground
 * getWeakness(PokemonType.Dragon) // Returns: PokemonType.Ice
 */
export function getWeakness(defenderType: PokemonType): PokemonType | null {
  switch (defenderType) {
    case PokemonType.Normal:
      return PokemonType.Fighting
    case PokemonType.Fire:
      return PokemonType.Water
    case PokemonType.Water:
      return PokemonType.Electric
    case PokemonType.Electric:
      return PokemonType.Ground
    case PokemonType.Grass:
      return PokemonType.Fire
    case PokemonType.Ice:
      return PokemonType.Fire
    case PokemonType.Fighting:
      return PokemonType.Psychic
    case PokemonType.Poison:
      return PokemonType.Psychic
    case PokemonType.Ground:
      return PokemonType.Water
    case PokemonType.Flying:
      return PokemonType.Electric
    case PokemonType.Psychic:
      return PokemonType.Dark
    case PokemonType.Bug:
      return PokemonType.Fire
    case PokemonType.Rock:
      return PokemonType.Water
    case PokemonType.Ghost:
      return PokemonType.Dark
    case PokemonType.Dragon:
      return PokemonType.Ice
    case PokemonType.Dark:
      return PokemonType.Fighting
    case PokemonType.Steel:
      return PokemonType.Fire
    case PokemonType.Fairy:
      return PokemonType.Poison
    default:
      return null
  }
}

/**
 * Calcule le multiplicateur de dégâts en fonction des types de l'attaquant et du défenseur
 * Si le type de l'attaquant correspond à la faiblesse du défenseur, les dégâts sont doublés
 *
 * @param {PokemonType} attackerType - Le type du Pokemon attaquant
 * @param {PokemonType} defenderType - Le type du Pokemon défenseur
 * @returns {number} Le multiplicateur: 2.0 si super efficace, 1.0 sinon
 *
 * @example
 * getDamageMultiplier(PokemonType.Water, PokemonType.Fire) // Returns: 2.0 (super efficace)
 * getDamageMultiplier(PokemonType.Fire, PokemonType.Water) // Returns: 1.0 (normal)
 * getDamageMultiplier(PokemonType.Grass, PokemonType.Grass) // Returns: 1.0 (normal)
 */
export function getDamageMultiplier(
  attackerType: PokemonType,
  defenderType: PokemonType,
): number {
  const weakness = getWeakness(defenderType)

  // Si le type de l'attaquant correspond à la faiblesse du défenseur
  if (weakness === attackerType) {
    return 2.0 // Super efficace (x2 dégâts)
  }

  return 1.0 // Dégâts normaux
}

/**
 * Calcule les dégâts finaux infligés lors d'une attaque entre deux Pokemon
 * Prend en compte la statistique d'attaque et le système de types
 * Les dégâts minimums sont toujours de 1
 *
 * @param {number} attackerAttack - Statistique d'attaque du Pokemon attaquant
 * @param {PokemonType} attackerType - Type du Pokemon attaquant
 * @param {PokemonType} defenderType - Type du Pokemon défenseur
 * @returns {number} Dégâts infligés (minimum 1)
 *
 * @example
 * // Pikachu (Electric, 55 attack) vs Gyarados (Water)
 * calculateDamage(55, PokemonType.Electric, PokemonType.Water) // Returns: 110 (55 * 2.0)
 *
 * // Charmander (Fire, 52 attack) vs Pikachu (Electric)
 * calculateDamage(52, PokemonType.Fire, PokemonType.Electric) // Returns: 52 (52 * 1.0)
 */
export function calculateDamage(
  attackerAttack: number,
  attackerType: PokemonType,
  defenderType: PokemonType,
): number {
  const multiplier = getDamageMultiplier(attackerType, defenderType)

  const damage = Math.floor(attackerAttack * multiplier)

  return Math.max(1, damage)
}
