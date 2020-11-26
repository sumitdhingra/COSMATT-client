export class Statement {
    actor: Actor;
    product: Product;
    entities: Entity[];
    classid?: string;
}

class Actor {
    uuid: string;
}

class Product {
    uuid: string;
}

class Entity {
    timestamp: number;
    verb: string;
    'item-code': string;
    timespent: number;
}
