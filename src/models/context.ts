import Debug from 'debug';
import { NormalizedPoint, NormalizedGeoJson } from './point';

const debug = Debug('producer:request');

export class ProviderResponse {
    public entities: Normalizable[] = [];

    prepare(attributes?: string[]): NormalizedObject[] {
        // Normalize all entities first
        const normalizedEntities = this.entities.map((entity) =>
            entity.normalize(attributes),
        );
        if (attributes === undefined) {
            return normalizedEntities;
        }

        // Reduce to id and type first
        const reducedEntities: NormalizedObject[] = normalizedEntities.map(
            (entitiy) => ({
                id: entitiy.id,
                type: entitiy.type,
            }),
        );
        // Append requested attributes
        for (
            let i = 0, attribute = attributes[i];
            i < attributes.length;
            i++, attribute = attributes[i]
        ) {
            for (let j = 0; j < normalizedEntities.length; j++) {
                if (normalizedEntities[j][attribute] === undefined) {
                    debug(
                        "Ignoring undefined requested attribute '%s' while normalizing object for the context broker",
                        attribute,
                    );
                } else {
                    reducedEntities[j][attribute] =
                        normalizedEntities[j][attribute];
                }
            }
        }
        return reducedEntities;
    }
}

export interface Normalizable {
    normalize(attributes?: string[]): NormalizedObject;
}

export type NormalizedObject = {
    type: string;
} & {
    [key: string]:
        | NormalizedPrimitiveObject
        | NormalizedGeoJson
        | NormalizedPoint
        | string
        | undefined;
};
export type NormalizedPrimitiveObject =
    | {
          type: 'Text' | 'URL' | 'DateTime' | 'Relationship';
          value: string;
      }
    | {
          type: 'Number';
          value: number;
      };
