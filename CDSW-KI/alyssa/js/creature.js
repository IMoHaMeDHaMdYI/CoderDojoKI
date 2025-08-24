class Creature {
    constructor(name, hp, attack, catchRate, imageUrl) {
        this.name = name;
        this.hp = hp;
        this.maxHp = hp;
        this.attack = attack;
        this.catchRate = catchRate;
        this.imageUrl = imageUrl;
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
    }

    isFainted() {
        return this.hp === 0;
    }
}

const creatures = {
    'fire_creature': new Creature('Ignis', 50, 10, 0.4, 'images/fire_creature.png'),
    'water_creature': new Creature('Aqua', 60, 8, 0.5, 'images/water_creature.png'),
    'grass_creature': new Creature('Terra', 55, 9, 0.45, 'images/grass_creature.png'),
};

function getRandomCreature() {
    const creatureKeys = Object.keys(creatures);
    const randomKey = creatureKeys[Math.floor(Math.random() * creatureKeys.length)];
    // Return a new instance so HP changes don't affect the base creature definition
    const baseCreature = creatures[randomKey];
    return new Creature(baseCreature.name, baseCreature.hp, baseCreature.attack, baseCreature.catchRate, baseCreature.imageUrl);
}
